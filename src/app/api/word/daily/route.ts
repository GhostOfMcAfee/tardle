import { NextResponse } from 'next/server';
import { VALID_WORDS } from '@/lib/words';

// Get a consistent index for a given date
function getDateBasedIndex(date: Date): number {
  const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % VALID_WORDS.length;
}

export async function GET() {
  try {
    const today = new Date();
    const index = getDateBasedIndex(today);
    const word = VALID_WORDS[index];

    return NextResponse.json({ word });
  } catch (error) {
    console.error('Error getting daily word:', error);
    return NextResponse.json({ error: 'Failed to get daily word' }, { status: 500 });
  }
} 