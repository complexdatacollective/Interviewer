import { isElectron } from '../utils/Environment';

// Initialise auto update if we are in electron
const updater = {
  checkForUpdate() {
    return new Promise((resolve, reject) => {
      if (isElectron()) {
        // update through IPC goes here
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('CHECK_FOR_UPDATE');

        ipcRenderer.on('UPDATE_AVAILABLE', (event, response) => {
          resolve(response);
        });

        ipcRenderer.on('UPDATE_NOT_AVAILABLE', (event, response) => {
          reject(response);
        });

        ipcRenderer.on('ERROR', (event, response) => {
          reject(new Error(response));
        });
      }
    });
  },
  downloadUpdate() {
    return new Promise((resolve, reject) => {
      if (isElectron()) {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('DOWNLOAD_UPDATE');

        ipcRenderer.on('UPDATE_DOWNLOADED', (event, response) => {
          resolve(response);
        });

        ipcRenderer.on('ERROR', (event, response) => {
          reject(new Error(response));
        });
      }
    });
  },
  installUpdate() {
    if (isElectron()) {
      // Install and restart
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('INSTALL_UPDATE');
    }
  },
};

export default updater;
