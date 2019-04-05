const { dialog } = require('electron');

const openDialogOptions = {
  buttonLabel: 'Open',
  nameFieldLabel: 'Open:',
  defaultPath: 'Protocol.netcanvas',
  filters: [{ name: 'Network Canvas', extensions: ['netcanvas'] }],
  properties: ['openFile'],
};

const openDialog = () =>
  new Promise((resolve, reject) => {
    dialog.showOpenDialog(openDialogOptions, (filename) => {
      if (!filename) { reject('Import protocol dialog cancelled.'); return; }
      resolve(filename[0]);
    });
  });

module.exports = {
  openDialog,
};
