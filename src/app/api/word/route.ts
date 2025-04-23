import { NextResponse } from 'next/server';
import { VALID_WORDS } from '@/lib/words';

export async function GET() {
  try {
    // Select a random word
    const randomIndex = Math.floor(Math.random() * VALID_WORDS.length);
    const word = VALID_WORDS[randomIndex];

    return NextResponse.json({ word });
  } catch (error) {
    console.error('Error selecting word:', error);
    return NextResponse.json({ error: 'Failed to get word' }, { status: 500 });
  }
} 