const { ipcMain, BrowserWindow } = require('electron');
const log = require('./log');

let FileExportManager;
let currentExport = null;

/**
 * Register export-related IPC handlers
 */
const registerExportHandlers = () => {
  log.info('Registering export handlers...');

  // Lazy load FileExportManager to avoid circular dependencies during startup
  // Path is relative to dist/main/components/ after build
  if (!FileExportManager) {
    FileExportManager = require('../network-exporters/src/FileExportManager');
  }

  ipcMain.handle('export:start', async (event, { sessions, protocols, exportOptions }) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const fileExportManager = new FileExportManager(exportOptions);

    const sendToRenderer = (channel, data) => {
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    };

    // Forward events to renderer
    fileExportManager.on('begin', (data) => sendToRenderer('export:begin', data));
    fileExportManager.on('update', (data) => sendToRenderer('export:update', data));
    fileExportManager.on('session-exported', (sessionId) => sendToRenderer('export:session-exported', sessionId));
    fileExportManager.on('error', (error) => sendToRenderer('export:error', error));
    fileExportManager.on('finished', (data) => sendToRenderer('export:finished', data));
    fileExportManager.on('cancelled', (data) => sendToRenderer('export:cancelled', data));

    try {
      const exportTask = await fileExportManager.exportSessions(sessions, protocols);
      currentExport = exportTask;
      await exportTask.run();
      return { success: true };
    } catch (error) {
      log.error('Export failed:', error);
      return { success: false, error: error.message };
    } finally {
      fileExportManager.removeAllListeners();
      currentExport = null;
    }
  });

  ipcMain.handle('export:abort', () => {
    if (currentExport) {
      currentExport.abort();
    }
  });

  ipcMain.handle('export:setConsideringAbort', (event, value) => {
    if (currentExport) {
      currentExport.setConsideringAbort(value);
    }
  });

  log.info('Export handlers registered');
};

/**
 * Remove export IPC handlers (for cleanup)
 */
const removeExportHandlers = () => {
  const handlers = [
    'export:start',
    'export:abort',
    'export:setConsideringAbort',
  ];

  handlers.forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
};

module.exports = {
  registerExportHandlers,
  removeExportHandlers,
};
