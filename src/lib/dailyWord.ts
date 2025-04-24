import { VALID_WORDS } from './words';

// Function to get a deterministic index for a given date
function getDailyIndex(date: Date): number {
  // Get days since epoch (January 1, 1970)
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  
  // Use the days since epoch to get a deterministic index
  // This ensures the same word is chosen for everyone on the same day
  return daysSinceEpoch % VALID_WORDS.length;
}

// Get today's word
export function getDailyWord(): string {
  const today = new Date();
  // Reset to midnight UTC to ensure same word for everyone
  today.setUTCHours(0, 0, 0, 0);
  const index = getDailyIndex(today);
  return VALID_WORDS[index];
}

// Get a random word (for practice mode)
export function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * VALID_WORDS.length);
  return VALID_WORDS[randomIndex];
} 