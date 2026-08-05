import { Word } from '../types';
import rawWordsData from './words3655.json';

export const INITIAL_WORDS_DB: Word[] = rawWordsData as Word[];

// Fast lookup map by word number for O(1) retrieval
const wordMap = new Map<number, Word>();
INITIAL_WORDS_DB.forEach((w) => wordMap.set(w.no, w));

/**
 * Gets a vocabulary entry by word number (1-3655)
 */
export function getWordByNumber(no: number): Word {
  const found = wordMap.get(no);
  if (found) return found;
  return INITIAL_WORDS_DB[0];
}

/**
 * Gets all words range array for library / search / scheduler
 */
export function getWordsRange(startNo: number, endNo: number): Word[] {
  const start = Math.max(1, startNo);
  const end = Math.min(INITIAL_WORDS_DB.length, endNo);
  return INITIAL_WORDS_DB.slice(start - 1, end);
}

