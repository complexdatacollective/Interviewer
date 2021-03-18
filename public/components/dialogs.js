const { dialog } = require('electron');
const { BrowserWindow } = require('electron');

const openDialogOptions = {
  buttonLabel: 'Open',
  nameFieldLabel: 'Open:',
  defaultPath: 'Protocol.netcanvas',
  filters: [{ name: 'Network Canvas Interviewer protocol', extensions: ['netcanvas'] }],
  properties: ['openFile'],
};

const openDialog = () => {
  const browserWindow = BrowserWindow.getFocusedWindow();

  return new Promise((resolve, reject) => dialog.showOpenDialog(browserWindow, openDialogOptions)
    .then(({ canceled, filePaths }) => {
      // TODO: reject Error()
      // eslint-disable-next-line prefer-promise-reject-errors
      if (canceled || !filePaths) { reject('Import protocol dialog cancelled.'); }
      // TODO: reject Error()
      // eslint-disable-next-line prefer-promise-reject-errors
      if (!filePaths.length || filePaths.length !== 1) { reject('Only a single protocol may be imported at a time.'); }
      resolve(filePaths[0]);
    }));
};

module.exports = {
  openDialog,
};
