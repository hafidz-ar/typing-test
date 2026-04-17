/**
 * scoreCalculator.js — Score Calculator
 * Pure functions for calculating WPM and accuracy.
 * No DOM, no side effects.
 */

/**
 * Calculate Words Per Minute.
 * Formula: (correctChars / 5) / (durationSeconds / 60), rounded to integer.
 * @param {number} correctChars
 * @param {number} durationSeconds
 * @returns {number}
 */
export function calculateWPM(correctChars, durationSeconds) {
  return Math.round((correctChars / 5) / (durationSeconds / 60));
}

/**
 * Calculate accuracy as a percentage.
 * Formula: (correctChars / totalTyped) * 100, rounded to 1 decimal.
 * Returns 0 if totalTyped === 0.
 * @param {number} correctChars
 * @param {number} totalTyped
 * @returns {number}
 */
export function calculateAccuracy(correctChars, totalTyped) {
  if (totalTyped === 0) return 0;
  return Math.round((correctChars / totalTyped) * 1000) / 10;
}
