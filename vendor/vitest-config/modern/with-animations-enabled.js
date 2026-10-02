import { MotionGlobalConfig } from 'motion/react';

/**
 * Temporarily restore real Motion timing for a test that exercises
 * animation-driven behaviour — an exit window, a transition callback, anything
 * whose subject is the time between the state change and the DOM catching up.
 *
 * `disable-animations` finishes every animation immediately, which is what the
 * rest of the suite wants; a test about the window in between has to opt out,
 * and must restore the previous value even when it fails.
 *
 * @template T
 * @param {() => T | Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withAnimationsEnabled(callback) {
  const previousValue = MotionGlobalConfig.skipAnimations;
  MotionGlobalConfig.skipAnimations = false;

  try {
    return await callback();
  } finally {
    MotionGlobalConfig.skipAnimations = previousValue;
  }
}
