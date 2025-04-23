import { NextResponse } from 'next/server';
import { isValidWord } from '@/lib/words';

export async function POST(request: Request) {
  try {
    const { word } = await request.json();
    const valid = isValidWord(word);
    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Error validating word:', error);
    return NextResponse.json({ error: 'Failed to validate word' }, { status: 500 });
  }
} 