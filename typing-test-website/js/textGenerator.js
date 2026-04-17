/**
 * textGenerator.js — Text Generator
 * Generates random text from word lists based on selected language.
 */

import { WORDS_ENGLISH, WORDS_INDONESIA } from './wordData.js';

/** @type {string[] | null} */
let lastGeneratedText = null;

/**
 * Generates a random array of words for the given language.
 * Guarantees at least `minWords` words and prevents two identical
 * consecutive texts (Requirement 2.5 / Property 4).
 *
 * @param {'english'|'indonesia'} language
 * @param {number} [minWords=50]
 * @returns {string[]}
 */
export function generateText(language, minWords = 50) {
  const wordList = language === 'indonesia' ? WORDS_INDONESIA : WORDS_ENGLISH;

  let result;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    result = pickRandomWords(wordList, minWords);
    attempts++;
  } while (
    attempts < maxAttempts &&
    lastGeneratedText !== null &&
    arraysEqual(result, lastGeneratedText)
  );

  lastGeneratedText = result;
  return result;
}

/**
 * Picks `count` random words from `wordList`.
 * @param {string[]} wordList
 * @param {number} count
 * @returns {string[]}
 */
function pickRandomWords(wordList, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * wordList.length);
    result.push(wordList[index]);
  }
  return result;
}

/**
 * Shallow equality check for two string arrays.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {boolean}
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
