// Pulled in here because every vitest.config.ts in the workspace imports this
// module, and a `declare module` augmentation only applies to a TypeScript
// program that has loaded the file carrying it.
import './jest-dom-matchers.js';

// Ships alongside setup-path.js so TypeScript consumers can type this module
// when the package is installed as a real dependency (the mirrored app trees
// vendor it via file:vendor/vitest-config, where node_modules JS gets no
// implicit types and `next build` fails with TS7016 without this file).
export declare const disableModernAnimationsSetup: string;
