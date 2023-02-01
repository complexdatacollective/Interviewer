import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

export const __dirname = dirname(fileURLToPath(import.meta.url)); // Resolves to CWD