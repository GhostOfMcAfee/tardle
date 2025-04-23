'use client';

import React from 'react';
import { LetterState } from '../lib/types';

interface GameBoardProps {
  board: string[][];
  currentRow: number;
  letterStates: Record<string, LetterState>;
  rowLetterStates: Record<string, LetterState>[];
  invalidRow: number;
}

// Define our colors
const BLUE = '#009cd9';
const YELLOW = '#fcd100';
const RED = '#e71e07';
const GREEN = '#41b133';

// Fixed pattern for the border colors
const BORDER_COLORS = [
  BLUE, RED, YELLOW, BLUE, GREEN,      // Row 1
  YELLOW, GREEN, BLUE, RED, YELLOW,    // Row 2
  RED, BLUE, GREEN, YELLOW, BLUE,      // Row 3
  GREEN, YELLOW, RED, GREEN, RED,      // Row 4
  BLUE, RED, YELLOW, BLUE, GREEN,      // Row 5
  YELLOW, GREEN, BLUE, RED, YELLOW     // Row 6
];

// Add these keyframe animations at the top of the file after imports
const styles = `
@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10%);
  }
}
`;

export function GameBoard({ board, currentRow, letterStates, rowLetterStates, invalidRow }: GameBoardProps) {
  // Add the styles to the document
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getTileColor = (letter: string, rowIndex: number) => {
    if (rowIndex >= currentRow || !letter) return 'bg-black';
    
    const state = rowLetterStates[rowIndex][letter.toLowerCase()];
    switch (state) {
      case LetterState.Blue:
        return `bg-[#006a99] border-[${BLUE}]`;
      case LetterState.Correct:
        return `bg-[#287f1e] border-[${GREEN}]`;
      case LetterState.Present:
        return `bg-[#b89700] border-[${YELLOW}]`;
      case LetterState.Absent:
        return `bg-[#a31505] border-[${RED}]`;
      default:
        return 'bg-black';
    }
  };

  return (
    <div className="grid gap-1 md:gap-2 max-w-sm mx-auto px-4">
      {board.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`grid grid-cols-5 gap-1 md:gap-2 ${rowIndex === invalidRow ? 'animate-shake' : ''}`}
        >
          {row.map((letter, colIndex) => {
            const borderColorIndex = rowIndex * 5 + colIndex;
            const currentBorderColor = rowIndex >= currentRow ? BORDER_COLORS[borderColorIndex] : undefined;
            const colorClasses = getTileColor(letter, rowIndex);
            const [bgClass, borderClass] = colorClasses.split(' ');
            const borderColor = currentBorderColor || (borderClass ? borderClass.replace('border-[', '').replace(']', '') : undefined);
            
            const glowEffect = borderColor && rowIndex < currentRow
              ? `inset 0 0 8px ${borderColor}, 0 0 5px ${borderColor}`
              : currentBorderColor ? `0 0 5px ${currentBorderColor}` : undefined;

            // Add animation styles for the letter
            const letterStyle = letter ? {
              animation: rowIndex === currentRow 
                ? 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                : rowIndex < currentRow 
                  ? 'bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                  : 'none',
              display: 'inline-block'
            } : {};

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{ 
                  fontFamily: "'SuperMario256', sans-serif",
                  lineHeight: 1,
                  paddingTop: '0.5rem',
                  borderColor: borderColor,
                  boxShadow: glowEffect
                }}
                className={`
                  aspect-square flex items-center justify-center
                  text-2xl md:text-[2.25rem] font-bold rounded
                  border-2 transition-all duration-300 text-white
                  ${bgClass}
                `}
              >
                <span style={letterStyle}>
                  {letter.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
} 