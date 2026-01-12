const url = require('url');
const path = require('path');
const log = require('./log');

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
  const rendererPath = path.join(__dirname, '../../renderer/index.html');
  log.info(`Loading production renderer from: ${rendererPath}`);
  return url.format({
    pathname: rendererPath,
    protocol: 'file:',
  });
}());

module.exports = appUrl;
