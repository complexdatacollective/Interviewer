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
    dialog.showOpenDialog(openDialogOptions, (filenames) => {
      if (!filenames) { reject('Import protocol dialog cancelled.'); return; }
      if (!filenames.length || filenames.length !== 1) { reject('Only a single protocol may be imported at a time.'); return; }
      resolve(filenames[0]);
    });
  });

module.exports = {
  openDialog,
};
