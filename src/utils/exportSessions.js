import FileExportManager from './network-exporters/src/FileExportManager';

const saveDialog = (defaultFileName, extension) => {
  const { dialog } = window.require('electron').remote;

  return new Promise((resolve) => {
    dialog.showSaveDialog({
      filters: [{ name: extension, extensions: [extension] }],
      defaultPath: defaultFileName,
    }, (filename) => {
      if (filename === undefined) resolve({ cancelled: true });

      resolve({ cancelled: false, filename });
    });
  });
};

const exportSessions = (sessions, installedProtocols) => {
  const { shell } = window.require('electron');

  // Instantiate file export manager
  // TODO: populate export options from app state.
  const fileExportManager = new FileExportManager({
    exportGraphML: false,
    exportCSV: true,
  });

  // TODO: can we show the save dialog when the file is ready to be written instead?
  const defaultFileName = 'networkCanvasExport.zip';
  return saveDialog(defaultFileName, 'zip')
    .then(({ cancelled, filename }) => {
      if (cancelled) { return { cancelled }; }

      return fileExportManager.exportSessions(sessions, installedProtocols, filename)
        .then(() => shell.showItemInFolder(filename));
    });
};

export default exportSessions;
