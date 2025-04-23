'use client';

import { LetterState } from '../lib/types';
import React from 'react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Record<string, LetterState>;
}

// Define our colors
const BLUE = '#009cd9';
const YELLOW = '#fcd100';
const RED = '#e71e07';
const GREEN = '#41b133';

// Fixed pattern for key borders - distribute colors across the keyboard
const KEY_COLORS = {
  Q: BLUE, W: RED, E: YELLOW, R: GREEN, T: BLUE, Y: RED, U: YELLOW, I: GREEN, O: BLUE, P: RED,
  A: YELLOW, S: GREEN, D: BLUE, F: RED, G: YELLOW, H: GREEN, J: BLUE, K: RED, L: YELLOW,
  Enter: GREEN, Z: BLUE, X: RED, C: YELLOW, V: GREEN, B: BLUE, N: RED, M: YELLOW, Backspace: GREEN
};

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
];

// Add keyframe animations
const styles = `
@keyframes keyPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.92);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes stateChange {
  0% {
    transform: rotateX(0);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0);
  }
}

.key-press {
  animation: keyPress 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.state-change {
  animation: stateChange 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

const Keyboard = ({ onKeyPress, letterStates }: KeyboardProps) => {
  // Add the styles to the document
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Track previous letter states for animation
  const prevLetterStates = React.useRef(letterStates);
  const [animatingKeys, setAnimatingKeys] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const changedKeys = new Set<string>();
    Object.entries(letterStates).forEach(([key, state]) => {
      if (state !== prevLetterStates.current[key]) {
        changedKeys.add(key.toUpperCase());
      }
    });
    if (changedKeys.size > 0) {
      setAnimatingKeys(changedKeys);
      setTimeout(() => setAnimatingKeys(new Set()), 500); // Reset after animation
    }
    prevLetterStates.current = letterStates;
  }, [letterStates]);

  const handleKeyPress = (key: string) => {
    const keyElement = document.querySelector(`[data-key="${key}"]`);
    keyElement?.classList.remove('key-press');
    keyElement?.classList.add('key-press');
    setTimeout(() => keyElement?.classList.remove('key-press'), 150);
    onKeyPress(key);
  };

  const getKeyColor = (key: string) => {
    const state = letterStates[key.toLowerCase()];
    switch (state) {
      case LetterState.Blue:
        return { bg: 'bg-[#006a99]', border: BLUE };
      case LetterState.Correct:
        return { bg: 'bg-[#287f1e]', border: GREEN };
      case LetterState.Present:
        return { bg: 'bg-[#b89700]', border: YELLOW };
      case LetterState.Absent:
        return { bg: 'bg-[#a31505]', border: RED };
      default:
        return { bg: 'bg-black', border: undefined };
    }
  };

  return (
    <div className="w-full bg-zinc-800">
      <div className="flex flex-col gap-2 max-w-3xl mx-auto">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const isSpecialKey = key === 'Enter' || key === 'Backspace';
              const keyColor = KEY_COLORS[key as keyof typeof KEY_COLORS];
              const state = letterStates[key.toLowerCase()];
              const { bg, border } = getKeyColor(key);
              
              const borderColor = state ? border : keyColor;
              const glowEffect = state
                ? `inset 0 0 8px ${border}, 0 0 5px ${border}`
                : `0 0 5px ${keyColor}`;

              return (
                <button
                  key={key}
                  data-key={key}
                  className={`${bg} px-2 py-4 rounded-lg text-2xl font-bold border-2 ${
                    isSpecialKey ? 'w-[100px]' : 'w-[50px]'
                  } h-[65px] transition-all duration-300 hover:opacity-90 ${
                    animatingKeys.has(key) ? 'state-change' : ''
                  }`}
                  onClick={() => handleKeyPress(key)}
                  style={{ 
                    fontFamily: "'SuperMario256', sans-serif",
                    borderColor: borderColor,
                    boxShadow: glowEffect,
                    color: state ? 'white' : borderColor,
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {key === 'Backspace' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Keyboard }; 