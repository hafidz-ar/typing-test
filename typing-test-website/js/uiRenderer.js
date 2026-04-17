/**
 * uiRenderer.js — UI Renderer
 * All DOM manipulation and rendering for the typing test app.
 */

const textArea = document.getElementById('text-area');
const textContent = document.getElementById('text-content');

// LineTracker state
const lineMap = new Map(); // Map<number, number[]> — offsetTop → [spanIndex, ...]
let activeLineTop = -1;    // offsetTop of the currently active line; -1 = none yet
let currentOffset = 0;     // current translateY value in pixels

/** Callback invoked by ResizeObserver after lineMap is rebuilt. Set via setResizeCallback(). */
let _onResizeCallback = null;

/**
 * Rebuild the lineMap by reading offsetTop of all .char spans inside textContent.
 * Spans sharing the same offsetTop are grouped into the same lineMap entry.
 * @private
 */
function _rebuildLineMap() {
  const spans = textContent.querySelectorAll('.char');
  lineMap.clear();
  spans.forEach((span, i) => {
    const top = span.offsetTop;
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top).push(i);
  });
}

/**
 * Scroll the text content so the active line (at cursorPosition) is vertically
 * centred inside the text-area container.
 * @param {number} cursorPosition - index of the current cursor span
 */
export function scrollToActiveLine(cursorPosition) {
  const spans = textContent.querySelectorAll('.char');
  const span = spans[cursorPosition];
  if (!span) return;

  const spanTop = span.offsetTop;
  if (spanTop === activeLineTop) return; // baris tidak berubah, skip

  activeLineTop = spanTop;
  const containerHeight = textArea.clientHeight;
  const lineHeight = span.offsetHeight;
  const targetOffset = -(spanTop - containerHeight / 2 + lineHeight / 2);
  currentOffset = targetOffset;
  textContent.style.transform = `translateY(${targetOffset}px)`;
}

/**
 * Reset all LineTracker state and clear the transform on textContent.
 * Rebuilds the lineMap from the current DOM after reset.
 */
export function resetScroll() {
  lineMap.clear();
  activeLineTop = -1;
  currentOffset = 0;
  textContent.style.transform = 'translateY(0px)';
  _rebuildLineMap();
}

/**
 * Register a callback to be invoked after the ResizeObserver rebuilds the lineMap.
 * app.js uses this to re-scroll to the current cursor position on resize.
 * @param {Function} fn
 */
export function setResizeCallback(fn) {
  _onResizeCallback = fn;
}

// ResizeObserver — rebuilds lineMap and notifies app.js whenever textArea changes size (Req 1.2)
const _resizeObserver = new ResizeObserver(() => {
  _rebuildLineMap();
  if (typeof _onResizeCallback === 'function') {
    _onResizeCallback();
  }
});
_resizeObserver.observe(textArea);

const timerDisplay = document.getElementById('timer-display');
const resultScreen = document.getElementById('result-screen');
const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultCorrect = document.getElementById('result-correct');
const resultWrong = document.getElementById('result-wrong');
const capsLockWarning = document.getElementById('caps-lock-warning');

/**
 * Render an array of characters as individual <span> elements in the text area.
 * Each span gets the class 'char' and 'pending' by default.
 * @param {string[]} chars
 */
export function renderText(chars) {
  textContent.innerHTML = '';
  const fragment = document.createDocumentFragment();
  chars.forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char pending';
    span.textContent = char;
    fragment.appendChild(span);
  });
  textContent.appendChild(fragment);
  resetScroll();
}

/**
 * Append new characters as <span class="char pending"> elements to the text area
 * without clearing existing spans. Safe to call mid-session.
 * @param {string[]} chars
 */
export function appendChars(chars) {
  const fragment = document.createDocumentFragment();
  chars.forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char pending';
    span.textContent = char;
    fragment.appendChild(span);
  });
  textContent.appendChild(fragment);
  _rebuildLineMap();
}

/**
 * Update the CSS class of the span at the given position.
 * Removes all state classes and applies the new one.
 * @param {number} position
 * @param {'pending'|'correct'|'wrong'|'cursor'} state
 */
export function updateCharState(position, state) {
  const spans = textContent.querySelectorAll('.char');
  const span = spans[position];
  if (!span) return;
  span.className = `char ${state}`;
}

/**
 * Update the timer display with the remaining seconds.
 * @param {number} remaining
 */
export function updateTimer(remaining) {
  timerDisplay.textContent = remaining;
}

/**
 * Populate the result screen with session statistics.
 * @param {number} wpm
 * @param {number} accuracy
 * @param {number} correct
 * @param {number} wrong
 */
export function renderResults(wpm, accuracy, correct, wrong) {
  resultWpm.textContent = wpm;
  resultAccuracy.textContent = `${accuracy}%`;
  resultCorrect.textContent = correct;
  resultWrong.textContent = wrong;
}

/**
 * Show the result screen overlay.
 */
export function showResultScreen() {
  resultScreen.hidden = false;
}

/**
 * Hide the result screen overlay.
 */
export function hideResultScreen() {
  resultScreen.hidden = true;
}

/**
 * Show the Caps Lock warning element.
 */
export function showCapsLockWarning() {
  if (!capsLockWarning) return;
  capsLockWarning.classList.remove('hidden');
}

/**
 * Hide the Caps Lock warning element.
 */
export function hideCapsLockWarning() {
  if (!capsLockWarning) return;
  capsLockWarning.classList.add('hidden');
}

/**
 * Mark the active language button.
 * @param {string} language - 'english' | 'indonesia'
 */
export function setActiveLanguage(language) {
  document.querySelectorAll('.language-btn').forEach((btn) => {
    const isActive = btn.dataset.lang === language;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Mark the active duration button.
 * @param {number} duration - 15 | 30 | 60 | 120
 */
export function setActiveDuration(duration) {
  document.querySelectorAll('.duration-btn').forEach((btn) => {
    const isActive = Number(btn.dataset.duration) === duration;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}
