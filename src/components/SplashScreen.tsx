import React from 'react';

interface SplashScreenProps {
  onModeSelect: (mode: 'daily' | 'random') => void;
}

// Define our colors
const BLUE = '#009cd9';
const YELLOW = '#fcd100';
const RED = '#e71e07';
const GREEN = '#41b133';

export function SplashScreen({ onModeSelect }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center px-4">
      {/* Title */}
      <h1 
        className="text-7xl font-bold flex justify-center relative mb-12"
        style={{ 
          fontFamily: "'SuperMario256', sans-serif",
          letterSpacing: '-0.1em'
        }}
      >
        <span style={{ color: BLUE, WebkitTextStroke: '4px black', position: 'relative', zIndex: 6 }}>T</span>
        <span style={{ color: YELLOW, WebkitTextStroke: '4px black', position: 'relative', zIndex: 5 }}>A</span>
        <span style={{ color: RED, WebkitTextStroke: '4px black', position: 'relative', zIndex: 4 }}>R</span>
        <span style={{ color: GREEN, WebkitTextStroke: '4px black', position: 'relative', zIndex: 3 }}>D</span>
        <span style={{ color: BLUE, WebkitTextStroke: '4px black', position: 'relative', zIndex: 2 }}>L</span>
        <span style={{ color: YELLOW, WebkitTextStroke: '4px black', position: 'relative', zIndex: 1 }}>E</span>
      </h1>

      {/* Mode Selection Buttons */}
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button
          onClick={() => onModeSelect('daily')}
          className="w-full py-6 px-8 rounded-xl text-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          style={{
            fontFamily: "'SuperMario256', sans-serif",
            background: `linear-gradient(to bottom, ${BLUE}, #006a99)`,
            color: 'white',
            border: '3px solid #006a99',
            boxShadow: `0 0 10px ${BLUE}`,
            textShadow: '3px 3px 3px rgba(0,0,0,0.7)',
            minHeight: '90px',
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '0.5em'  // Add extra padding at the bottom to offset the font's natural alignment
          }}
        >
          Word of the Day
        </button>

        <button
          onClick={() => onModeSelect('random')}
          className="w-full py-6 px-8 rounded-xl text-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          style={{
            fontFamily: "'SuperMario256', sans-serif",
            background: `linear-gradient(to bottom, ${GREEN}, #287f1e)`,
            color: 'white',
            border: '3px solid #287f1e',
            boxShadow: `0 0 10px ${GREEN}`,
            textShadow: '3px 3px 3px rgba(0,0,0,0.7)',
            minHeight: '90px',
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '0.5em'  // Add extra padding at the bottom to offset the font's natural alignment
          }}
        >
          Random Word
        </button>
      </div>

      {/* Instructions */}
      <div 
        className="mt-12 text-white text-center"
        style={{ fontFamily: "'SuperMario256', sans-serif" }}
      >
        <p className="text-lg mb-2">Choose your mode:</p>
        <p className="text-sm opacity-80 mb-1">Daily - Play today's challenge</p>
        <p className="text-sm opacity-80">Random - Practice with random words</p>
      </div>
    </div>
  );
} 