import 'vitest';

declare module 'vitest' {
  interface Assertion<R, T> {
    /**
     * `@testing-library/jest-dom`'s `toHaveTextContent`, which takes a pattern
     * as well as a literal and matches a substring rather than the whole
     * content.
     *
     * Vitest 5's browser matchers (`@vitest/browser/matchers`) declare a
     * `toHaveTextContent` of their own that is exact-match and string-only,
     * having moved pattern matching to `toMatchTextContent`. That declaration
     * augments `vitest`'s `Assertion` for the whole TypeScript program, so it
     * reaches a package's jsdom suites as soon as anything else in the same
     * program imports a browser-mode entry point — which every package with a
     * Storybook test project does, through the `@vitest/browser-playwright`
     * import in its own `vitest.config.ts`.
     *
     * The jsdom suites are not running that matcher: their setup file imports
     * `@testing-library/jest-dom/vitest`, whose `expect.extend` call replaces
     * `toHaveTextContent` with the jest-dom implementation. jest-dom 7 still
     * writes its augmentation against Vitest 4's single-parameter
     * `Assertion<T>`, so under Vitest 5's `Assertion<R, T>` it no longer merges
     * and the browser signature is left standing alone.
     *
     * Declaring the wider signature here restores the overload the call sites
     * have always been checked against. Delete this file once jest-dom ships an
     * augmentation written against `Assertion<R, T>`.
     */
    toHaveTextContent(
      text: string | number | RegExp,
      options?: { normalizeWhitespace: boolean },
    ): R;
  }
}
