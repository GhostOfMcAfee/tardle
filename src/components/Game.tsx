'use client';

import { useState, useEffect } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { Keyboard } from '@/components/Keyboard';
import { VictoryModal } from '@/components/VictoryModal';
import { GameState, LetterState, LetterCounts } from '@/lib/types';
import { ValidWord } from '@/lib/words';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Function to get today's date in YYYY-MM-DD format in user's timezone
const getTodayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

interface GameProps {
  initialRandomMode: boolean;
}

export default function Game({ initialRandomMode }: GameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invalidWord, setInvalidWord] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showAnswerPopup, setShowAnswerPopup] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(initialRandomMode);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(MAX_ATTEMPTS).fill('').map(() => Array(WORD_LENGTH).fill('')),
    currentRow: 0,
    currentCol: 0,
    gameOver: false,
    word: 'board' as ValidWord,
    letterStates: {},
    rowLetterStates: Array(MAX_ATTEMPTS).fill({}).map(() => ({})),
  });

  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we've completed today's word
        const todayKey = getTodayKey();
        const completedDaily = localStorage.getItem(`completed_daily_${todayKey}`);
        const cachedDailyWord = localStorage.getItem(`daily_word_${todayKey}`);
        
        // If in random mode, always fetch a new word
        if (isRandomMode) {
          const response = await fetch('/api/word?mode=practice');
          if (!response.ok) throw new Error('Failed to fetch word');
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          setGameState((prev: GameState) => ({ ...prev, word: data.word }));
          return;
        }
        
        // If we have today's word cached and we're in daily mode, use it
        if (cachedDailyWord && !isRandomMode) {
          setGameState((prev: GameState) => ({ ...prev, word: cachedDailyWord as ValidWord }));
          return;
        }
        
        // Otherwise fetch the daily word and cache it
        const response = await fetch('/api/word?mode=daily');
        if (!response.ok) throw new Error('Failed to fetch word');
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        // Cache the daily word
        localStorage.setItem(`daily_word_${todayKey}`, data.word);
        setGameState((prev: GameState) => ({ ...prev, word: data.word }));
      } catch (error) {
        console.error('Error fetching word:', error);
        setError(error instanceof Error ? error.message : 'Failed to start game');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, [isRandomMode]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleKeyPress('Enter');
      } else if (event.key === 'Backspace') {
        handleKeyPress('Backspace');
      } else {
        const key = event.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
          handleKeyPress(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]); // Add gameState as dependency to ensure we have latest state

  const handleInvalidWord = () => {
    setInvalidWord(true);
    setShowNotification(true);
    
    // Reset shake animation after it completes
    setTimeout(() => {
      setInvalidWord(false);
    }, 500);

    // Hide notification after 1.5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 1500);
  };

  const handleKeyPress = async (key: string) => {
    if (gameState.gameOver) return;

    if (key === 'Enter') {
      if (gameState.currentCol === WORD_LENGTH) {
        const currentWord = gameState.board[gameState.currentRow].join('').toLowerCase();
        
        try {
          const response = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: currentWord }),
          });
          const { valid } = await response.json();
          
          if (!valid) {
            handleInvalidWord();
            return;
          }
          
          checkWord(currentWord);
        } catch (error) {
          console.error('Error validating word:', error);
        }
      }
    } else if (key === 'Backspace') {
      if (gameState.currentCol > 0) {
        const newBoard = [...gameState.board];
        newBoard[gameState.currentRow][gameState.currentCol - 1] = '';
        setGameState((prev: GameState) => ({
          ...prev,
          board: newBoard,
          currentCol: prev.currentCol - 1,
        }));
      }
    } else if (
      gameState.currentCol < WORD_LENGTH && 
      /^[A-Z]$/.test(key) && 
      gameState.currentRow < MAX_ATTEMPTS
    ) {
      const newBoard = [...gameState.board];
      newBoard[gameState.currentRow][gameState.currentCol] = key;
      setGameState((prev: GameState) => ({
        ...prev,
        board: newBoard,
        currentCol: prev.currentCol + 1,
      }));
    }
  };

  const handlePlayAgain = () => {
    // Set random mode and clear the board
    setIsRandomMode(true);
    setShowVictoryModal(false);
    setShowAnswerPopup(false);
    setGameState({
      board: Array(MAX_ATTEMPTS).fill('').map(() => Array(WORD_LENGTH).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameOver: false,
      word: 'board' as ValidWord, // This will be replaced when useEffect runs
      letterStates: {},
      rowLetterStates: Array(MAX_ATTEMPTS).fill({}).map(() => ({})),
    });
  };

  const checkWord = (word: string) => {
    const newLetterStates = { ...gameState.letterStates };
    const newRowLetterStates = [...gameState.rowLetterStates];
    const newBoard = [...gameState.board];
    const targetWord = gameState.word.toLowerCase();
    const currentRowStates: Record<string, LetterState> = {};
    
    // Count target word letter frequencies
    const targetLetterCount: {[key: string]: number} = {};
    for (const letter of targetWord) {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    }

    // Count guess word letter frequencies
    const guessLetterCount: {[key: string]: number} = {};
    for (const letter of word) {
      guessLetterCount[letter] = (guessLetterCount[letter] || 0) + 1;
    }

    // Initialize all positions as absent
    const letterResults = Array(WORD_LENGTH).fill(LetterState.Absent);
    
    // First pass: Mark only exact matches
    const isCorrectWord = word === targetWord;
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = word[i];
      if (letter === targetWord[i]) {
        letterResults[i] = LetterState.Correct;
        targetLetterCount[letter]--;
        guessLetterCount[letter]--;
      }
    }

    // Second pass: Mark yellow letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = word[i];
      if (letterResults[i] === LetterState.Correct) continue;
      
      if (targetWord.includes(letter) && targetLetterCount[letter] > 0) {
        letterResults[i] = LetterState.Present;
        targetLetterCount[letter]--;
        guessLetterCount[letter]--;
      }
    }

    // If this is the winning guess, convert all letters in this row to blue
    if (isCorrectWord) {
      for (let i = 0; i < WORD_LENGTH; i++) {
        letterResults[i] = LetterState.Blue;
      }
    }

    // Update the board and letter states
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = word[i].toLowerCase();
      const state = letterResults[i];
      
      // Update current row's letter states
      currentRowStates[letter] = state;

      // Update keyboard letter states - for keyboard, we want to show the "best" state
      // Blue > Correct > Present > Absent
      if (state === LetterState.Blue ||
          (state === LetterState.Correct && !isCorrectWord) ||
          (state === LetterState.Present && newLetterStates[letter] !== LetterState.Correct) ||
          (state === LetterState.Absent && !newLetterStates[letter])) {
        newLetterStates[letter] = state;
      }

      // Update board - uppercase for correct/blue, lowercase for others
      newBoard[gameState.currentRow][i] = (state === LetterState.Correct || state === LetterState.Blue) ?
        letter.toUpperCase() : letter.toLowerCase();
    }

    // Store the letter states for this row
    newRowLetterStates[gameState.currentRow] = currentRowStates;

    const isWin = word === targetWord;
    const isGameOver = isWin || gameState.currentRow === MAX_ATTEMPTS - 1;

    setGameState((prev: GameState) => ({
      ...prev,
      board: newBoard,
      currentRow: prev.currentRow + 1,
      currentCol: 0,
      gameOver: isGameOver,
      letterStates: newLetterStates,
      rowLetterStates: newRowLetterStates,
    }));

    if (isGameOver) {
      if (isWin) {
        // If this was the daily word, mark it as completed
        if (!isRandomMode) {
          const todayKey = getTodayKey();
          localStorage.setItem(`completed_daily_${todayKey}`, 'true');
        }
        setShowVictoryModal(true);
      } else {
        setShowAnswerPopup(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-white mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <header className="text-center pt-8 pb-2">
        <h1 
          className="text-7xl font-bold flex justify-center relative"
          style={{ 
            fontFamily: "'SuperMario256', sans-serif",
            letterSpacing: '-0.1em'
          }}
        >
          <span style={{ color: '#009cd9', WebkitTextStroke: '4px black', position: 'relative', zIndex: 6 }}>T</span>
          <span style={{ color: '#fcd100', WebkitTextStroke: '4px black', position: 'relative', zIndex: 5 }}>A</span>
          <span style={{ color: '#e71e07', WebkitTextStroke: '4px black', position: 'relative', zIndex: 4 }}>R</span>
          <span style={{ color: '#41b133', WebkitTextStroke: '4px black', position: 'relative', zIndex: 3 }}>D</span>
          <span style={{ color: '#009cd9', WebkitTextStroke: '4px black', position: 'relative', zIndex: 2 }}>L</span>
          <span style={{ color: '#fcd100', WebkitTextStroke: '4px black', position: 'relative', zIndex: 1 }}>E</span>
        </h1>
        <div 
          className="text-white mt-2 text-lg"
          style={{ fontFamily: "'SuperMario256', sans-serif" }}
        >
          {isRandomMode ? 'Random Mode' : 'Word of the Day'}
        </div>
      </header>
      {showNotification && (
        <div className="notification-popup">
          <span style={{ color: '#009cd9', WebkitTextStroke: '2px black' }}>I</span>
          <span style={{ color: '#fcd100', WebkitTextStroke: '2px black' }}>N</span>
          <span style={{ color: '#e71e07', WebkitTextStroke: '2px black' }}>V</span>
          <span style={{ color: '#41b133', WebkitTextStroke: '2px black' }}>A</span>
          <span style={{ color: '#009cd9', WebkitTextStroke: '2px black' }}>L</span>
          <span style={{ color: '#fcd100', WebkitTextStroke: '2px black' }}>I</span>
          <span style={{ color: '#e71e07', WebkitTextStroke: '2px black' }}>D</span>
          <span style={{ marginLeft: '0.5em', color: '#41b133', WebkitTextStroke: '2px black' }}> </span>
          <span style={{ color: '#009cd9', WebkitTextStroke: '2px black' }}>W</span>
          <span style={{ color: '#fcd100', WebkitTextStroke: '2px black' }}>O</span>
          <span style={{ color: '#e71e07', WebkitTextStroke: '2px black' }}>R</span>
          <span style={{ color: '#41b133', WebkitTextStroke: '2px black' }}>D</span>
        </div>
      )}
      <main className="flex flex-col items-center gap-8 px-4 py-4">
        <div className="w-full relative">
          <GameBoard 
            board={gameState.board} 
            currentRow={gameState.currentRow}
            letterStates={gameState.letterStates}
            rowLetterStates={gameState.rowLetterStates}
            invalidRow={invalidWord ? gameState.currentRow : -1}
          />
          {showAnswerPopup && (
            <div className="answer-popup">
              <div className="text-white text-xl mb-2">The answer was</div>
              <div className="answer-word mb-4">
                {gameState.word.split('').map((letter, index) => (
                  <span 
                    key={index}
                    style={{ 
                      color: index % 4 === 0 ? '#009cd9' : 
                             index % 4 === 1 ? '#fcd100' : 
                             index % 4 === 2 ? '#e71e07' : '#41b133',
                      WebkitTextStroke: '2px black',
                      fontFamily: "'SuperMario256', sans-serif",
                      fontSize: '2.5rem',
                      letterSpacing: '-0.1em'
                    }}
                  >
                    {letter.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="text-white text-lg mb-4">Want to play again?</div>
              <button
                onClick={() => window.location.reload()}
                className="play-again-button"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        <div className="w-full max-w-2xl mx-auto">
          <Keyboard
            onKeyPress={handleKeyPress}
            letterStates={gameState.letterStates}
          />
        </div>
      </main>
      <VictoryModal
        isOpen={showVictoryModal}
        onPlayAgain={handlePlayAgain}
        guesses={gameState.board}
        letterStates={gameState.rowLetterStates}
        isDaily={!isRandomMode}
      />
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translate(-50%, -60%); }
          100% { opacity: 1; transform: translate(-50%, -50%); }
        }

        .notification-popup {
          position: fixed;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          padding: 10px 20px;
          border-radius: 8px;
          font-family: 'SuperMario256', sans-serif;
          font-size: 1.5rem;
          animation: fadeInOut 1.5s ease-in-out;
          z-index: 1000;
          display: flex;
          letter-spacing: -0.1em;
        }

        .answer-popup {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.9);
          padding: 20px 30px;
          border-radius: 12px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.5s ease-out;
          text-align: center;
          border: 2px solid #fcd100;
          box-shadow: 0 0 10px rgba(252, 209, 0, 0.5);
        }

        .answer-word {
          display: flex;
          gap: 2px;
        }

        .play-again-button {
          background: linear-gradient(to bottom, #41b133, #2d7c24);
          color: white;
          font-family: 'SuperMario256', sans-serif;
          font-size: 1.25rem;
          padding: 10px 24px;
          border-radius: 8px;
          border: 2px solid #2d7c24;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
          cursor: pointer;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
        }

        .play-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
          background: linear-gradient(to bottom, #4cc53d, #338f28);
        }

        .play-again-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div className="flex-grow"></div>
    </div>
  );
} 