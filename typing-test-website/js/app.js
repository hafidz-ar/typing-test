/**
 * app.js — Entry Point & Orchestrator
 * Manages AppState and coordinates all modules.
 * Requirements: 1.1, 1.3, 1.4, 3.1–3.6, 4.1–4.5, 5.1–5.4, 8.1–8.4
 */

import { generateText } from './textGenerator.js';
import { validateChar, canAdvance } from './inputValidator.js';
import { calculateWPM, calculateAccuracy } from './scoreCalculator.js';
import { start as timerStart, stop as timerStop, reset as timerReset } from './timer.js';
import {
  renderText,
  updateCharState,
  updateTimer,
  renderResults,
  showResultScreen,
  hideResultScreen,
  setActiveLanguage,
  setActiveDuration,
} from './uiRenderer.js';

// ---------------------------------------------------------------------------
// AppState — single source of truth (Req 1.1, 1.4, 4.1)
// ---------------------------------------------------------------------------

const AppState = {
  /** @type {'english'|'indonesia'} */
  language: 'english',

  /** @type {15|30|60|120} */
  duration: 60,

  /** @type {'idle'|'running'|'finished'} */
  status: 'idle',

  /**
   * Array of CharResult objects for the current text.
   * @type {Array<{char: string, state: 'pending'|'correct'|'wrong'|'cursor'}>}
   */
  currentText: [],

  /** Zero-based index of the current cursor position. */
  cursorPosition: 0,

  stats: {
    correctChars: 0,
    wrongChars: 0,
    totalTyped: 0,
  },

  /** Tracks last generated word array to prevent identical consecutive texts. */
  lastGeneratedText: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a fresh CharResult array from a word array.
 * Words are joined with spaces; each character becomes one entry.
 * @param {string[]} words
 * @returns {Array<{char: string, state: 'pending'|'correct'|'wrong'|'cursor'}>}
 */
function buildCharArray(words) {
  return words.join(' ').split('').map((char) => ({ char, state: 'pending' }));
}

/**
 * Re-render every span to match the current AppState.currentText states,
 * then place the cursor class on the current position.
 */
function syncUI() {
  AppState.currentText.forEach((entry, i) => {
    updateCharState(i, entry.state);
  });
  if (AppState.status !== 'finished' && AppState.cursorPosition < AppState.currentText.length) {
    updateCharState(AppState.cursorPosition, 'cursor');
  }
}

// ---------------------------------------------------------------------------
// 8.1 — init(): setup event listeners, load initial text, render initial UI
// ---------------------------------------------------------------------------

/**
 * Initialise the application.
 * Called once on DOMContentLoaded.
 */
export function init() {
  // Language buttons (Req 1.1, 1.4)
  document.querySelectorAll('.language-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === AppState.language) return;
      AppState.language = lang;
      setActiveLanguage(lang);
      resetSession();
    });
  });

  // Duration buttons (Req 4.1, 4.5)
  document.querySelectorAll('.duration-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dur = Number(btn.dataset.duration);
      if (dur === AppState.duration) return;
      AppState.duration = dur;
      setActiveDuration(dur);
      // Only reset timer display if session hasn't started yet
      if (AppState.status === 'idle') {
        updateTimer(dur);
      } else {
        resetSession();
      }
    });
  });

  // Reset button (Req 8.1)
  document.getElementById('reset-btn').addEventListener('click', resetSession);

  // Result screen "Try Again" button
  const resultResetBtn = document.getElementById('result-reset-btn');
  if (resultResetBtn) {
    resultResetBtn.addEventListener('click', resetSession);
  }

  // Global keyboard handler (Req 3.1–3.6, 4.2, 8.4)
  document.addEventListener('keydown', handleKeyInput);

  // Load initial text and render
  _loadNewText();
  setActiveLanguage(AppState.language);
  setActiveDuration(AppState.duration);
  updateTimer(AppState.duration);
}

/**
 * Generate a new text, populate AppState.currentText, and render it.
 * Retries up to 3 times if the generated text is empty (Req 2.1, error handling).
 * @private
 */
function _loadNewText() {
  let words = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (words.length === 0 && attempts < maxAttempts) {
    words = generateText(AppState.language);
    attempts++;
  }

  // Final safety net: should never be reached given textGenerator's own fallback
  if (words.length === 0) {
    words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog',
             'and', 'then', 'runs', 'away', 'into', 'the', 'forest', 'where', 'it',
             'finds', 'a', 'safe', 'place', 'to', 'rest', 'for', 'the', 'night',
             'before', 'starting', 'a', 'new', 'adventure', 'the', 'next', 'day',
             'with', 'great', 'energy', 'and', 'enthusiasm', 'for', 'life', 'ahead',
             'in', 'the', 'wide', 'open', 'world', 'full', 'of', 'wonder'];
  }

  AppState.lastGeneratedText = words.join(' ');
  AppState.currentText = buildCharArray(words);
  renderText(AppState.currentText.map((e) => e.char));
  // Place cursor at position 0
  if (AppState.currentText.length > 0) {
    updateCharState(0, 'cursor');
  }
}

// ---------------------------------------------------------------------------
// 8.2 — handleKeyInput: character input, Backspace, timer start (Req 3.1–3.6, 4.2)
// ---------------------------------------------------------------------------

/**
 * Main keyboard event handler.
 * @param {KeyboardEvent} event
 */
export function handleKeyInput(event) {
  // Ignore all input when session is finished (Req 4.4)
  if (AppState.status === 'finished') return;

  // Tab + Enter shortcut for reset (Req 8.4) — handled in resetSession listener
  // (Tab is captured there; we skip it here to avoid interfering)
  if (event.key === 'Tab') return;

  if (event.key === 'Backspace') {
    _handleBackspace();
    return;
  }

  // Only process printable single characters
  if (event.key.length !== 1) return;

  // Prevent default browser behaviour (e.g. space scrolling)
  event.preventDefault();

  const pos = AppState.cursorPosition;

  // Guard: don't go past the end of the text
  if (pos >= AppState.currentText.length) return;

  // Start timer on first keystroke (Req 4.2)
  if (AppState.status === 'idle') {
    AppState.status = 'running';
    timerStart(
      AppState.duration,
      (remaining) => {
        updateTimer(remaining);
      },
      onTimerExpire,
    );
  }

  const refChar = AppState.currentText[pos].char;
  const result = validateChar(event.key, refChar);

  // Check if we can advance (Req 3.5) — canAdvance checks the *current* position
  // We only block advancing if the current char is already marked wrong and
  // the user is trying to type over it without backspacing.
  // Per design: canAdvance returns false when position state is 'wrong'.
  if (!canAdvance(AppState.currentText, pos)) return;

  // Update state
  AppState.currentText[pos].state = result;
  AppState.stats.totalTyped += 1;
  if (result === 'correct') {
    AppState.stats.correctChars += 1;
  } else {
    AppState.stats.wrongChars += 1;
  }

  // Render the typed character
  updateCharState(pos, result);

  // Advance cursor
  const nextPos = pos + 1;
  AppState.cursorPosition = nextPos;

  if (nextPos < AppState.currentText.length) {
    updateCharState(nextPos, 'cursor');
  }
}

/**
 * Handle Backspace key: move cursor back one position (Req 3.6).
 * @private
 */
function _handleBackspace() {
  const pos = AppState.cursorPosition;

  // Backspace at position 0 does nothing (Req 3.6 edge case)
  if (pos === 0) return;

  const prevPos = pos - 1;

  // Undo the stat that was recorded for the character being deleted
  const prevState = AppState.currentText[prevPos].state;
  if (prevState === 'correct' || prevState === 'wrong') {
    AppState.stats.totalTyped = Math.max(0, AppState.stats.totalTyped - 1);
    if (prevState === 'correct') {
      AppState.stats.correctChars = Math.max(0, AppState.stats.correctChars - 1);
    } else {
      AppState.stats.wrongChars = Math.max(0, AppState.stats.wrongChars - 1);
    }
  }

  // Reset the previous character back to pending
  AppState.currentText[prevPos].state = 'pending';
  updateCharState(prevPos, 'cursor');

  // Clear cursor from current position
  if (pos < AppState.currentText.length) {
    updateCharState(pos, 'pending');
  }

  AppState.cursorPosition = prevPos;
}

// ---------------------------------------------------------------------------
// 8.3 — resetSession + Tab+Enter shortcut (Req 8.1–8.4)
// ---------------------------------------------------------------------------

/**
 * Reset the session: stop timer, clear stats, load new text, restore UI.
 * Can be called at any time (idle, running, or finished).
 */
export function resetSession() {
  // Stop and reset timer (Req 8.2, 8.3)
  timerStop();
  timerReset();

  // Reset state
  AppState.status = 'idle';
  AppState.cursorPosition = 0;
  AppState.stats.correctChars = 0;
  AppState.stats.wrongChars = 0;
  AppState.stats.totalTyped = 0;

  // Hide result screen if visible
  hideResultScreen();

  // Restore timer display to selected duration (Req 8.3)
  updateTimer(AppState.duration);

  // Load a new (different) text and render it (Req 8.2)
  _loadNewText();
}

// Tab + Enter shortcut (Req 8.4)
// We track Tab being held, then fire reset on Enter while Tab is down.
let _tabHeld = false;

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    _tabHeld = true;
  }
  if (event.key === 'Enter' && _tabHeld) {
    event.preventDefault();
    resetSession();
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Tab') {
    _tabHeld = false;
  }
});

// ---------------------------------------------------------------------------
// 8.4 — onTimerExpire: finish session, calculate score, show results (Req 4.4, 5.1–5.4)
// ---------------------------------------------------------------------------

/**
 * Called by the timer when the countdown reaches zero.
 * Finalises the session and displays results.
 */
export function onTimerExpire() {
  // Lock input (Req 4.4)
  AppState.status = 'finished';

  const { correctChars, wrongChars, totalTyped } = AppState.stats;

  // Edge case: no characters typed → WPM = 0, accuracy = 0% (Req 5.4)
  const wpm = totalTyped === 0 ? 0 : calculateWPM(correctChars, AppState.duration);
  const accuracy = calculateAccuracy(correctChars, totalTyped);

  // Render results and show result screen (Req 5.3)
  renderResults(wpm, accuracy, correctChars, wrongChars);
  showResultScreen();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

// Initialise once the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
