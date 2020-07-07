import FileExportManager from './network-exporters/src/FileExportManager';

const saveDialog = (defaultFileName, extension) => {
  const { dialog } = window.require('electron').remote;

  return dialog.showSaveDialog({
    filters: [{ name: extension, extensions: [extension] }],
    defaultPath: defaultFileName,
  });
};

const exportSessions = (exportOptions, sessions, installedProtocols) => {
  const { shell } = window.require('electron');

  // Instantiate file export manager
  // TODO: populate export options from app state.
  const fileExportManager = new FileExportManager(exportOptions);

  // TODO: can we show the save dialog when the file is ready to be written instead?
  const defaultFileName = 'networkCanvasExport.zip';
  return saveDialog(defaultFileName, 'zip')
    .then(({ canceled, filePath }) => {
      if (canceled) { return { cancelled: canceled }; }

      return fileExportManager.exportSessions(sessions, installedProtocols, filePath)
        .then(() => {
          shell.showItemInFolder(filePath);
          return { cancelled: canceled, filePath };
        });
    });
};

export default exportSessions;
