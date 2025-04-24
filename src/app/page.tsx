'use client';

import { Suspense, useState } from 'react';
import Game from '@/components/Game';
import { SplashScreen } from '@/components/SplashScreen';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);

  const handleModeSelect = (mode: 'daily' | 'random') => {
    setIsRandomMode(mode === 'random');
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <SplashScreen onModeSelect={handleModeSelect} />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    }>
      <Game initialRandomMode={isRandomMode} />
    </Suspense>
  );
}
