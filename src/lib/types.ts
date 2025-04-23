import { ValidWord } from './words';

export enum LetterState {
  Absent = 'absent',
  Present = 'present',
  Correct = 'correct',
  Blue = 'blue',
}

export interface GameState {
  board: string[][];
  currentRow: number;
  currentCol: number;
  gameOver: boolean;
  word: ValidWord;
  letterStates: Record<string, LetterState>;
  rowLetterStates: Record<string, LetterState>[];
}

export interface LetterCounts {
  [key: string]: number;
} 