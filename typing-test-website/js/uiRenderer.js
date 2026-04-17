/**
 * uiRenderer.js — UI Renderer
 * All DOM manipulation and rendering for the typing test app.
 */

const textArea = document.getElementById('text-area');
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
  textArea.innerHTML = '';
  const fragment = document.createDocumentFragment();
  chars.forEach((char) => {
    const span = document.createElement('span');
    span.className = 'char pending';
    span.textContent = char;
    fragment.appendChild(span);
  });
  textArea.appendChild(fragment);
}

/**
 * Update the CSS class of the span at the given position.
 * Removes all state classes and applies the new one.
 * @param {number} position
 * @param {'pending'|'correct'|'wrong'|'cursor'} state
 */
export function updateCharState(position, state) {
  const spans = textArea.querySelectorAll('.char');
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
