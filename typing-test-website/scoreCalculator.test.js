/**
 * Tests for scoreCalculator.js, textGenerator.js, and inputValidator.js
 * Covers property-based tests (Properties 1, 3, 4, 5, 10 & 11) and unit edge cases.
 */

import fc from 'fast-check';
import { calculateWPM, calculateAccuracy } from './js/scoreCalculator.js';
import { generateText } from './js/textGenerator.js';
import { WORDS_ENGLISH, WORDS_INDONESIA } from './js/wordData.js';
import { validateChar, canAdvance } from './js/inputValidator.js';

// --- Property 1: Teks yang Dihasilkan Sesuai Bahasa yang Dipilih ---

// Feature: typing-test-website, Property 1
// Validates: Requirements 1.2, 2.3, 2.4
test('Properti 1: Teks yang Dihasilkan Sesuai Bahasa yang Dipilih', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('english', 'indonesia'),
      (language) => {
        const wordSet = language === 'indonesia'
          ? new Set(WORDS_INDONESIA)
          : new Set(WORDS_ENGLISH);
        const result = generateText(language);
        return result.every(word => wordSet.has(word));
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property 2: Teks yang Dihasilkan Memiliki Minimal 50 Kata ---

// Feature: typing-test-website, Property 2
// Validates: Requirements 2.1
test('Properti 2: Teks yang Dihasilkan Memiliki Minimal 50 Kata', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('english', 'indonesia'),
      (language) => {
        const result = generateText(language);
        return result.length >= 50;
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property Tests ---

// Feature: typing-test-website, Property 10
// Validates: Requirements 5.1
test('Properti 10: Formula WPM Selalu Benar', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 10000 }),
      fc.integer({ min: 1, max: 120 }),
      (correctChars, durationSeconds) => {
        const expected = Math.round((correctChars / 5) / (durationSeconds / 60));
        expect(calculateWPM(correctChars, durationSeconds)).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: typing-test-website, Property 11
// Validates: Requirements 5.2, 5.4
test('Properti 11: Formula Akurasi Selalu Benar', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 10000 }).chain(total =>
        fc.tuple(fc.integer({ min: 0, max: total }), fc.constant(total))
      ),
      ([correctChars, totalTyped]) => {
        const expected = Math.round((correctChars / totalTyped) * 1000) / 10;
        expect(calculateAccuracy(correctChars, totalTyped)).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property 3: Teks Hanya Mengandung Karakter Valid ---

// Feature: typing-test-website, Property 3
// Validates: Requirements 2.2
test('Properti 3: Teks yang Dihasilkan Hanya Mengandung Karakter Valid', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('english', 'indonesia'),
      (language) => {
        const text = generateText(language).join(' ');
        expect(text).toMatch(/^[a-zA-Z0-9àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ\s.,?!]*$/i);
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property 4: Tidak Ada Dua Teks Identik Berturut-Turut ---

// Feature: typing-test-website, Property 4
// Validates: Requirements 2.5
test('Properti 4: Tidak Ada Dua Teks Identik Berturut-Turut', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('english', 'indonesia'),
      (language) => {
        const first = generateText(language);
        const second = generateText(language);
        // The two consecutive results must not be identical
        const firstJoined = first.join(' ');
        const secondJoined = second.join(' ');
        return firstJoined !== secondJoined;
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property 5: Validasi Karakter Deterministik ---

// Feature: typing-test-website, Property 5
// Validates: Requirements 3.1
test('Properti 5: Validasi Karakter Deterministik', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 1 }),
      fc.string({ minLength: 1, maxLength: 1 }),
      (typed, reference) => {
        const result = validateChar(typed, reference);
        if (typed === reference) {
          expect(result).toBe('correct');
        } else {
          expect(result).toBe('wrong');
        }
      }
    ),
    { numRuns: 100 }
  );
});

// --- Property 6: Pencegahan Maju Saat Karakter Salah ---

// Feature: typing-test-website, Property 6
// Validates: Requirements 3.5
test('Properti 6: Pencegahan Maju Saat Karakter Salah', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 20 }).chain(len =>
        fc.tuple(
          fc.integer({ min: 0, max: len - 1 }),
          fc.array(
            fc.record({
              char: fc.string({ minLength: 1, maxLength: 1 }),
              state: fc.constantFrom('pending', 'correct', 'wrong', 'cursor'),
            }),
            { minLength: len, maxLength: len }
          )
        )
      ),
      ([position, history]) => {
        // Force the entry at `position` to have state 'wrong'
        const typedHistory = history.map((entry, i) =>
          i === position ? { ...entry, state: 'wrong' } : entry
        );
        expect(canAdvance(typedHistory, position)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});

// --- Unit Tests (edge cases) ---
// Validates: Requirements 5.4

test('calculateWPM(0, 60) mengembalikan 0', () => {
  expect(calculateWPM(0, 60)).toBe(0);
});

test('calculateAccuracy(0, 0) mengembalikan 0', () => {
  expect(calculateAccuracy(0, 0)).toBe(0);
});

test('calculateAccuracy(50, 100) mengembalikan 50.0', () => {
  expect(calculateAccuracy(50, 100)).toBe(50.0);
});
