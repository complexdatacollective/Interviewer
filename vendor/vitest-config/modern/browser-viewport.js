/**
 * The viewport every browser-mode project renders at.
 *
 * Vitest 4 defaulted to 1200x900 and Vitest 5 defaults to 414x896, a phone.
 * Every story and component test in this workspace was written and its
 * baselines taken against the desktop size, and a responsive component asked
 * to render at 414px collapses — correctly, but into a layout the assertions
 * were not describing. Naming the size here keeps the suites off a default
 * that has now moved once.
 *
 * A test that wants a different viewport sets one for itself: `page.viewport()`
 * inside the test, or a project of its own.
 */
export const BROWSER_VIEWPORT = { width: 1200, height: 900 };
