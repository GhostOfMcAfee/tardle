import { NextResponse } from 'next/server';
import { getDailyWord, getRandomWord } from '@/lib/dailyWord';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  // Get word based on mode
  const word = mode === 'practice' ? getRandomWord() : getDailyWord();

  return NextResponse.json({ word });
} 