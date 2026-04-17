/**
 * timer.js — Timer
 * Manages countdown timer using Date.now() for accuracy.
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */

let intervalId = null;
let endTime = null;
let totalDuration = 0;

/**
 * Start the countdown timer.
 * Uses Date.now() as time reference (not tick accumulation) for accuracy.
 * Polls every 100ms.
 *
 * @param {number} durationSeconds
 * @param {(remaining: number) => void} onTick
 * @param {() => void} onExpire
 */
export function start(durationSeconds, onTick, onExpire) {
    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    totalDuration = durationSeconds;
    endTime = Date.now() + durationSeconds * 1000;

    intervalId = setInterval(() => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining <= 0) {
            clearInterval(intervalId);
            intervalId = null;
            endTime = null;
            onExpire();
        } else {
            onTick(remaining);
        }
    }, 100);
}

/**
 * Stop the active interval without resetting state.
 */
export function stop() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

/**
 * Stop the interval and return state to initial.
 */
export function reset() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    endTime = null;
    totalDuration = 0;
}

/**
 * Returns remaining time in seconds.
 * @returns {number}
 */
export function getRemaining() {
    if (endTime === null) {
        return 0;
    }
    return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}
