/**
 * updater.js
 *
 * Please use manual update only when it is really required, otherwise please
 * use recommended non-intrusive auto update.
 *
 * Import steps:
 * 1. create `updater.js` for the code snippet
 * 2. require `updater.js` for menu implementation, and set `checkForUpdates`
 *    callback from `updater` for the click property of `Check Updates...` MenuItem.
 */

const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.autoDownload = false;

autoUpdater.on('error', (event, error) => {
  const errorMessage = error ? (error.stack || error).toString() : `Unknown error ${event.toString()}`;

  log.error(errorMessage);

  dialog.showErrorBox('Error:', errorMessage);
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall());
  });
});

module.exports = () => {
  autoUpdater.checkForUpdates();
};
