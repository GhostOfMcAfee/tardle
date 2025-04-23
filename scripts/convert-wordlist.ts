const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(process.cwd(), 'src', 'word list.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Process the words
const words = fileContent
  .split('\n')
  .map((line: string) => line.split(',')[0].trim()) // Take only the first column and trim whitespace
  .filter((word: string) => word && word.length === 5) // Only 5-letter words
  .map((word: string) => word.toLowerCase()) // Ensure lowercase
  .filter((word: string) => /^[a-z]+$/.test(word)) // Only letters
  .sort(); // Sort alphabetically

console.log(`Found ${words.length} valid words`);

// Format words into lines of 10
const formattedLines = [];
for (let i = 0; i < words.length; i += 10) {
  const chunk = words.slice(i, Math.min(i + 10, words.length));
  formattedLines.push('  ' + chunk.map((word: string) => `"${word}"`).join(', '));
}

// Create the TypeScript content
const tsContent = `// List of valid 5-letter words for the game
export const VALID_WORDS = [
${formattedLines.join(',\n')}
] as const;

// Type for valid words
export type ValidWord = typeof VALID_WORDS[number];

// Function to check if a word is valid
export function isValidWord(word: string): word is ValidWord {
  return VALID_WORDS.includes(word.toLowerCase() as ValidWord);
}
`;

// Write the TypeScript file
const tsPath = path.join(process.cwd(), 'src', 'lib', 'words.ts');
fs.writeFileSync(tsPath, tsContent, 'utf-8');

// Verify the file was written correctly
const writtenContent = fs.readFileSync(tsPath, 'utf-8');
const writtenWords = writtenContent.match(/"([^"]+)"/g)?.map((w: string) => w.replace(/"/g, '')) || [];
console.log(`\nVerification: ${writtenWords.length} words written to file`);

// Print a sample of the content
console.log('\nFirst few lines of the file:');
console.log(writtenContent.split('\n').slice(0, 10).join('\n')); 