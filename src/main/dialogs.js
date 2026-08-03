import { BrowserWindow, dialog } from 'electron';

const openDialogOptions = {
  buttonLabel: 'Open',
  nameFieldLabel: 'Open:',
  defaultPath: 'Protocol.netcanvas',
  filters: [
    { name: 'Network Canvas Interviewer protocol', extensions: ['netcanvas'] },
  ],
  properties: ['openFile'],
};

export const openDialog = () => {
  const browserWindow = BrowserWindow.getFocusedWindow();

  return new Promise((resolve, reject) =>
    dialog
      .showOpenDialog(browserWindow, openDialogOptions)
      .then(({ canceled, filePaths }) => {
        if (canceled || !filePaths) {
          reject(new Error('Import protocol dialog cancelled.'));
        }
        if (!filePaths.length || filePaths.length !== 1) {
          reject(
            new Error('Only a single protocol may be imported at a time.'),
          );
        }
        resolve(filePaths[0]);
      }),
  );
};
