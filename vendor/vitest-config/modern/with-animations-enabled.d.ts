// Ships alongside with-animations-enabled.js so TypeScript consumers can type
// this module (see setup-path.d.ts for why the declaration is needed).
export declare function withAnimationsEnabled<T>(
  callback: () => T | Promise<T>,
): Promise<T>;
