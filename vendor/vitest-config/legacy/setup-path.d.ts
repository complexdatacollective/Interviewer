// Ships alongside setup-path.js so TypeScript consumers can type this module
// when the package is installed as a real dependency (the mirrored app trees
// vendor it via file:vendor/vitest-config, where node_modules JS gets no
// implicit types and builds fail with TS7016 without this file).
export declare const disableAnimationsSetup: string;
