import path from 'node:path';

import { app, ipcMain } from 'electron';

import { registerProtocol as registerAssetProtocol } from './assetProtocol.js';
import { openDialog } from './dialogs.js';
import windowManager from './windowManager.js';

function getFileFromArgs(argv) {
  if (argv.length >= 2) {
    const filePath = argv[1];
    if (path.extname(filePath) === '.netcanvas') {
      return filePath;
    }
  }
  return null;
}

const appManager = {
  openFileWhenReady: null,
  init() {
    ipcMain.on('GET_ARGF', (event) => {
      if (process.platform === 'win32') {
        const filePath = getFileFromArgs(process.argv);
        if (filePath) {
          event.sender.send('OPEN_FILE', filePath);
        }
      }

      if (this.openFileWhenReady) {
        event.sender.send('OPEN_FILE', this.openFileWhenReady);
        this.openFileWhenReady = null;
      }
    });

    ipcMain.on('OPEN_DIALOG', () =>
      openDialog()
        .then((filePath) =>
          windowManager
            .getWindow()
            .then((window) => window.webContents.send('OPEN_FILE', filePath)),
        )
        .catch((_err) => {}),
    );
  },
  openFileFromArgs: function openFileFromArgs(argv) {
    return this.restore().then((window) => {
      if (process.platform === 'win32') {
        const filePath = getFileFromArgs(argv);
        if (filePath) {
          window.webContents.send('OPEN_FILE', filePath);
        }
      }

      return window;
    });
  },
  restore: function restore() {
    if (!app.isReady()) {
      return Promise.reject();
    }

    return windowManager.getWindow().then((window) => {
      if (window.isMinimized()) {
        window.restore();
      }

      window.focus();

      return window;
    });
  },
  openFile: function openFile(fileToOpen) {
    if (!app.isReady()) {
      // defer action
      this.openFileWhenReady = fileToOpen;
    } else {
      windowManager.getWindow().then((window) => {
        window.webContents.send('OPEN_FILE', fileToOpen);
      });
      this.openFileWhenReady = null;
    }
  },
  start: function start() {
    registerAssetProtocol();

    return windowManager.getWindow();
  },
};

export default appManager;
