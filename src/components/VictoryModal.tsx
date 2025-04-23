import React, { useEffect, useState } from 'react';
import { LetterState } from '../lib/types';
import ReactConfetti from 'react-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onPlayAgain: () => void;
  guesses: string[][];
  letterStates: Record<string, LetterState>[];
  isDaily: boolean;
}

// Define our colors
const BLUE = '#009cd9';
const YELLOW = '#fcd100';
const RED = '#e71e07';
const GREEN = '#41b133';

const generateTwitterText = (guesses: string[][], letterStates: Record<string, LetterState>[]) => {
  const emojiGrid = guesses
    .map((guess, rowIndex) => {
      if (!guess[0]) return null; // Skip empty rows
      return guess
        .map((letter) => {
          const state = letterStates[rowIndex][letter.toLowerCase()];
          switch (state) {
            case LetterState.Blue:
              return '🤑';
            case LetterState.Correct:
              return '🌈';
            case LetterState.Present:
              return '🫵';
            case LetterState.Absent:
              return '🤡';
            default:
              return '';
          }
        })
        .join('');
    })
    .filter(Boolean)
    .join('\n');

  return `TARDLE of the Day\n${emojiGrid}`;
};

const shareToTwitter = (guesses: string[][], letterStates: Record<string, LetterState>[]) => {
  const text = generateTwitterText(guesses, letterStates);
  const encodedText = encodeURIComponent(text);
  window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
};

export function VictoryModal({ isOpen, onPlayAgain, guesses, letterStates, isDaily }: VictoryModalProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    } else {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const letters = "Contardulations!".split('');
  const colors = [BLUE, YELLOW, RED, GREEN];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          colors={[BLUE, YELLOW, RED, GREEN]}
          recycle={true}
          numberOfPieces={200}
        />
      )}
      <div className="bg-zinc-900 p-8 rounded-xl max-w-md w-full mx-4 border-2 border-[#009cd9] shadow-lg"
           style={{ boxShadow: '0 0 20px #009cd9' }}>
        <h2 
          className="text-3xl md:text-4xl text-center mb-6 flex justify-center flex-wrap"
          style={{ fontFamily: "'SuperMario256', sans-serif" }}
        >
          {letters.map((letter, index) => (
            <span
              key={index}
              style={{
                color: colors[index % colors.length],
                WebkitTextStroke: '2px black',
                position: 'relative',
                zIndex: letters.length - index,
                marginRight: letter === ' ' ? '0.5rem' : '-0.1em'
              }}
            >
              {letter}
            </span>
          ))}
        </h2>

        {isDaily && (
          <p 
            className="text-white text-center mb-6 text-lg"
            style={{ fontFamily: "'SuperMario256', sans-serif" }}
          >
            Come back tomorrow for a new daily word!
          </p>
        )}
        
        <div className="flex flex-col gap-4">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-6 bg-[#41b133] hover:bg-[#328f28] text-white rounded-lg transition-colors duration-200 font-bold text-xl md:text-2xl"
            style={{ 
              fontFamily: "'SuperMario256', sans-serif",
              WebkitTextStroke: '2px black',
              textShadow: '2px 2px 0px black'
            }}
          >
            {isDaily ? 'Try Random Word' : 'Play Again'}
          </button>
          
          <button
            onClick={() => shareToTwitter(guesses, letterStates)}
            className="w-full py-4 px-6 bg-[#009cd9] hover:bg-[#007aa9] text-white rounded-lg transition-colors duration-200 font-bold text-xl md:text-2xl"
            style={{ 
              fontFamily: "'SuperMario256', sans-serif",
              WebkitTextStroke: '2px black',
              textShadow: '2px 2px 0px black'
            }}
          >
            Share on Twitter
          </button>
        </div>
      </div>
    </div>
  );
} 