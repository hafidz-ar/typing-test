/**
 * textGenerator.js — Text Generator
 * Generates random text from word lists based on selected language.
 */

import { WORDS_ENGLISH as _WORDS_ENGLISH, WORDS_INDONESIA as _WORDS_INDONESIA } from './wordData.js';

// Minimal hardcoded fallback lists used if wordData.js fails to load (Req 2.1, error handling)
const FALLBACK_ENGLISH = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
];

const FALLBACK_INDONESIA = [
  "yang", "dan", "di", "ini", "itu", "dengan", "untuk", "tidak", "ada",
  "dari", "dalam", "akan", "pada", "juga", "ke", "karena", "bisa",
  "sudah", "saya", "kita", "mereka", "dia", "kami", "kamu", "anda",
  "lebih", "atau", "tetapi", "jika", "maka", "seperti", "oleh", "saat",
  "setelah", "sebelum", "antara", "bagi", "tentang", "bahwa", "ketika",
  "hanya", "sangat", "masih", "belum", "pernah", "selalu", "sering",
  "jarang", "kadang", "mungkin", "harus", "boleh", "perlu", "ingin",
];

// Use imported lists if valid, otherwise fall back to hardcoded lists
const WORDS_ENGLISH = (Array.isArray(_WORDS_ENGLISH) && _WORDS_ENGLISH.length > 0)
  ? _WORDS_ENGLISH
  : FALLBACK_ENGLISH;

const WORDS_INDONESIA = (Array.isArray(_WORDS_INDONESIA) && _WORDS_INDONESIA.length > 0)
  ? _WORDS_INDONESIA
  : FALLBACK_INDONESIA;

/** @type {string[] | null} */
let lastGeneratedText = null;

/**
 * Generates a random array of words for the given language.
 * Guarantees at least `minWords` words and prevents two identical
 * consecutive texts (Requirement 2.5 / Property 4).
 * Retries up to 3 times if the generated text is empty (Req 2.1, error handling).
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
  const maxEmptyRetries = 3;

  // Retry up to maxEmptyRetries times if the result is empty (Req 2.1)
  for (let emptyRetry = 0; emptyRetry < maxEmptyRetries; emptyRetry++) {
    attempts = 0;

    do {
      result = pickRandomWords(wordList, minWords);
      attempts++;
    } while (
      attempts < maxAttempts &&
      lastGeneratedText !== null &&
      arraysEqual(result, lastGeneratedText)
    );

    if (result.length > 0) break;
  }

  // Final safety net: if still empty, return fallback words directly
  if (!result || result.length === 0) {
    result = (language === 'indonesia' ? FALLBACK_INDONESIA : FALLBACK_ENGLISH).slice(0, minWords);
  }

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
