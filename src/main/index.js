import { app, protocol } from 'electron';

import appManager from './appManager.js';
import { registerIpcHandlers } from './ipcHandlers.js';
import loadDevTools from './loadDevTools.js';
import log from './log.js';

// When Architect runs the Interviewer purely to serve its preview window's
// renderer (NC_PREVIEW_HOST), stay headless: Architect owns the visible window
// and hosts the preview IPC, so we only keep the Vite dev server alive and skip
// this instance's own window, dev tools, and CDP port.
const isPreviewHost = process.env.NC_PREVIEW_HOST === 'true';

// Dev-only: expose the Chrome DevTools Protocol so the renderer can be driven
// and inspected over CDP (e.g. for automated testing). Never enabled in a
// packaged build. Must be set before the app is ready.
if (!app.isPackaged && !isPreviewHost) {
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'asset',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  },
]);

log.info('App starting...');
appManager.init();

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (argv) => appManager.openFileFromArgs(argv));

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    registerIpcHandlers();

    // Headless preview-host: serve the renderer (the Vite dev server stays up
    // because no window is created and `window-all-closed` never fires) without
    // opening this instance's own window.
    if (isPreviewHost) {
      return;
    }

    appManager.start();
    loadDevTools();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (process.platform === 'darwin') {
      appManager.restore();
    }
  });

  app.on('open-file', (_event, filePath) => {
    appManager.openFile(filePath);
  });
}
