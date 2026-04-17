/**
 * inputValidator.js — Input Validator
 * Pure functions for validating typed characters against reference text.
 * No DOM, no side effects.
 */

/**
 * Validates a single typed character against the reference character.
 * @param {string} typed - The character the user typed
 * @param {string} reference - The expected character at this position
 * @returns {'correct'|'wrong'}
 */
export function validateChar(typed, reference) {
  return typed === reference ? 'correct' : 'wrong';
}

/**
 * Determines whether the user can advance past the given position.
 * Returns false if the character at `position` has state 'wrong',
 * preventing the user from skipping over an uncorrected mistake.
 * @param {Array<{char: string, state: 'pending'|'correct'|'wrong'|'cursor'}>} typedHistory
 * @param {number} position - The current cursor position to check
 * @returns {boolean}
 */
export function canAdvance(typedHistory, position) {
  const entry = typedHistory[position];
  if (!entry) return true;
  return entry.state !== 'wrong';
}
