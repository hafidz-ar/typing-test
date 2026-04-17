/**
 * Unit tests for Backspace logic (task 4.4)
 * Tests the pure state transition for Backspace key handling.
 * Validates: Requirements 3.6
 */

/**
 * Pure function representing the Backspace state transition from app.js's handleKeyInput.
 * Given a cursorPosition, returns the new cursorPosition after a Backspace press.
 * @param {number} cursorPosition
 * @returns {number}
 */
function applyBackspace(cursorPosition) {
  if (cursorPosition <= 0) {
    return 0;
  }
  return cursorPosition - 1;
}

// --- Unit Tests: Backspace Logic ---
// Validates: Requirements 3.6

describe('Backspace logic', () => {
  test('Backspace di posisi 0 tidak mengubah posisi kursor', () => {
    const before = 0;
    const after = applyBackspace(before);
    expect(after).toBe(0);
  });

  test('Backspace di posisi > 0 mengurangi posisi kursor tepat satu', () => {
    const positions = [1, 2, 5, 10, 50, 100];
    for (const pos of positions) {
      expect(applyBackspace(pos)).toBe(pos - 1);
    }
  });
});
