import { fileURLToPath } from 'node:url';

export const disableModernAnimationsSetup = fileURLToPath(
  new URL('./disable-animations.js', import.meta.url),
);
