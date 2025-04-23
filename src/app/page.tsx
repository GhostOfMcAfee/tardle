'use client';

import { Suspense } from 'react';
import Game from '@/components/Game';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    }>
      <Game />
    </Suspense>
  );
}
