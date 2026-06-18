import path from 'node:path';
import url, { fileURLToPath } from 'node:url';

import log from './log.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const appUrl = (function getAppUrl() {
  // In development, electron-vite provides the dev server URL
  if (process.env.NODE_ENV === 'development') {
    // electron-vite uses ELECTRON_RENDERER_URL for the dev server
    if (process.env.ELECTRON_RENDERER_URL) {
      log.info(`Using dev server URL: ${process.env.ELECTRON_RENDERER_URL}`);
      return process.env.ELECTRON_RENDERER_URL;
    }
    // Fallback to localhost:3000
    log.info('Using fallback dev server URL: http://localhost:3000');
    return 'http://localhost:3000';
  }

  // In production, load from the built renderer
  // __dirname is out/main/ since main process is bundled there
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  log.info(`Loading production renderer from: ${rendererPath}`);
  return url.format({
    pathname: rendererPath,
    protocol: 'file:',
  });
})();

export default appUrl;
