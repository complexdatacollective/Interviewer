import FileExportManager from './network-exporters/src/FileExportManager';

const exportSessions = (exportOptions, sessions, installedProtocols) => {
  // Instantiate file export manager
  const fileExportManager = new FileExportManager(exportOptions);
  // could fileExportManager emit events? could be used to handle individual
  // failure/completion

  return fileExportManager.exportSessions(sessions, installedProtocols);
};

export default exportSessions;
