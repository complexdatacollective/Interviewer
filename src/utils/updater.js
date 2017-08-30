import { isElectron } from '../utils/Environment';

// Initialise auto update if we are in electron
const updater = {
  checkForUpdate() {
    return new Promise((resolve, reject) => {
      if (isElectron()) {
        // update through IPC goes here
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('CHECK_FOR_UPDATE');

        // // Allow 20 seconds for a response, then fail.
        // setTimeout(() => {
        //   reject(new Error('Timeout'));
        // }, 20000);

        ipcRenderer.on('UPDATE_AVAILABLE', (response) => {
          resolve(response);
        });

        ipcRenderer.on('UPDATE_NOT_AVAILABLE', (response) => {
          reject(response);
        });

        ipcRenderer.on('ERROR', (event, message) => {
          reject(new Error(message));
        });
      }
    });
  },
  downloadUpdate() {
    return new Promise((resolve, reject) => {
      if (isElectron()) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('DOWNLOAD_UPDATE');

        ipcRenderer.on('UPDATE_DOWNLOADED', (response) => {
          resolve(response);
        });

        ipcRenderer.on('ERROR', (response) => {
          reject(new Error(response));
        });
      }
    });
  },
  installUpdate() {
    if (isElectron()) {
      // update through IPC goes here
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('INSTALL_UPDATE');
    }
  },
};

export default updater;
