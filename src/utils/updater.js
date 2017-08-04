import { isElectron } from '../utils/Environment';

// Initialise auto update if we are in electron
const checkForUpdate = () => {
  if (isElectron()) {
    // update through IPC goes here
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('CHECK_FOR_UPDATE');

    ipcRenderer.on('UPDATE_FOUND', (event, arg) => {
      console.log(arg);  // eslint-disable-line no-console
    });

    ipcRenderer.on('UP_TO_DATE', (event, arg) => {
      console.log(arg);  // eslint-disable-line no-console
    });
  }
};

module.exports = {
  checkForUpdate,
};
