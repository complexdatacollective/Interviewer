import { configure } from '@testing-library/dom';
import { MotionGlobalConfig } from 'motion/react';
import { afterAll, vi } from 'vitest';

// Keep the real Motion implementation in unit tests, but make every animation
// finish immediately. This covers components rendered without the app-level
// AnimationProvider, including AnimatePresence exit bookkeeping.
MotionGlobalConfig.skipAnimations = true;
globalThis.BASE_UI_ANIMATIONS_DISABLED = true;

// Testing Library gives every `waitFor`/`findBy*` one second, a budget whose
// only calibration is a developer's idle machine. CI runs the whole workspace's
// suites concurrently on a four-core runner: Architect's jsdom project alone
// takes ~30s locally and ~10min there. Waits that resolve in tens of
// milliseconds locally land either side of that one-second cliff under load, so
// the suite fails on a half-rendered DOM rather than on any assertion. Each
// project's `testTimeout` was already raised for exactly this reason; this is
// its Testing Library counterpart. It stays well under the 20s test timeout so
// a genuinely stuck wait still reports its own DOM rather than being cut short,
// and it costs nothing when a wait succeeds — `waitFor` polls and returns as
// soon as the condition holds.
configure({ asyncUtilTimeout: 5_000 });

// @tiptap/react defers `editor.destroy()` onto a 1ms timer so that remounting
// does not tear down an editor that is in fact still mounted. Vitest disposes
// the jsdom environment as soon as a file's hooks finish, so under load that
// timer can land in the gap between one file's teardown and the next file's
// setup, where `window` no longer exists. Tiptap's drag-handling plugin
// dereferences it unconditionally, so the run dies with `ReferenceError: window
// is not defined` as an unhandled error — failing the job with every test
// passing. Give the file's deferred unmount work a real tick while the DOM is
// still there.
afterAll(async () => {
  // The file is over; restoring real timers here cannot disturb a test, and
  // without it a suite that left fake timers installed would hang below.
  if (vi.isFakeTimers()) vi.useRealTimers();

  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
});
