/**
 * IPC Handlers for Network Canvas main process.
 * Registers all ipcMain.handle() handlers for secure IPC communication.
 *
 * These handlers replace direct Node.js access in the renderer process,
 * providing a controlled API for file system, dialogs, and other operations.
 */
const { ipcMain, dialog, app, shell, BrowserWindow } = require('electron');
const fse = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const decompress = require('decompress');
const log = require('./log');

/**
 * Register all IPC handlers
 */
const registerIpcHandlers = () => {
  log.info('Registering IPC handlers...');

  // ===================
  // Dialog Handlers
  // ===================

  ipcMain.handle('dialog:showOpen', async (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return dialog.showOpenDialog(window, options);
  });

  ipcMain.handle('dialog:showSave', async (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return dialog.showSaveDialog(window, options);
  });

  ipcMain.handle('dialog:showMessageBox', async (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return dialog.showMessageBox(window, options);
  });

  // ===================
  // App Info Handlers
  // ===================

  ipcMain.handle('app:getPath', async (_, name) => {
    const validPaths = ['home', 'appData', 'userData', 'temp', 'desktop', 'documents', 'downloads'];
    if (!validPaths.includes(name)) {
      throw new Error(`Invalid path name: ${name}`);
    }
    return app.getPath(name);
  });

  ipcMain.handle('app:getAppPath', async () => app.getAppPath());

  ipcMain.handle('app:getVersion', async () => app.getVersion());

  // ===================
  // File System Handlers
  // ===================

  ipcMain.handle('fs:readJson', async (_, filePath) => {
    log.info('fs:readJson', filePath);
    return fse.readJson(filePath);
  });

  ipcMain.handle('fs:writeJson', async (_, filePath, data, options) => {
    log.info('fs:writeJson', filePath);
    return fse.writeJson(filePath, data, options);
  });

  ipcMain.handle('fs:readFile', async (_, filePath, encoding) => {
    log.info('fs:readFile', filePath);
    if (encoding) {
      return fse.readFile(filePath, encoding);
    }
    // Return as base64 for binary files
    const buffer = await fse.readFile(filePath);
    return buffer.toString('base64');
  });

  ipcMain.handle('fs:writeFile', async (_, filePath, data) => {
    log.info('fs:writeFile', filePath);
    // Handle base64 encoded data
    if (typeof data === 'string' && data.length > 0) {
      // Check if it looks like base64
      const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(data.substring(0, 100));
      if (isBase64 && data.length > 1000) {
        return fse.writeFile(filePath, Buffer.from(data, 'base64'));
      }
    }
    return fse.writeFile(filePath, data);
  });

  ipcMain.handle('fs:copy', async (_, src, dest) => {
    log.info('fs:copy', src, '->', dest);
    return fse.copy(src, dest);
  });

  ipcMain.handle('fs:unlink', async (_, filePath) => {
    log.info('fs:unlink', filePath);
    return fse.unlink(filePath);
  });

  ipcMain.handle('fs:remove', async (_, filePath) => {
    log.info('fs:remove', filePath);
    return fse.remove(filePath);
  });

  ipcMain.handle('fs:rename', async (_, oldPath, newPath) => {
    log.info('fs:rename', oldPath, '->', newPath);
    return fse.rename(oldPath, newPath);
  });

  ipcMain.handle('fs:access', async (_, filePath, mode) => {
    log.info('fs:access', filePath);
    try {
      await fse.access(filePath, mode);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('fs:stat', async (_, filePath) => {
    log.info('fs:stat', filePath);
    const stats = await fse.stat(filePath);
    return {
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      mtime: stats.mtime,
      ctime: stats.ctime,
    };
  });

  ipcMain.handle('fs:mkdirp', async (_, dirPath) => {
    log.info('fs:mkdirp', dirPath);
    return fse.mkdirp(dirPath);
  });

  ipcMain.handle('fs:pathExists', async (_, filePath) => {
    log.info('fs:pathExists', filePath);
    return fse.pathExists(filePath);
  });

  ipcMain.handle('fs:readdir', async (_, dirPath) => {
    log.info('fs:readdir', dirPath);
    return fse.readdir(dirPath);
  });

  ipcMain.handle('fs:outputFile', async (_, filePath, data) => {
    log.info('fs:outputFile', filePath);
    return fse.outputFile(filePath, data);
  });

  ipcMain.handle('fs:mkdir', async (_, dirPath, options) => {
    log.info('fs:mkdir', dirPath);
    return fse.mkdir(dirPath, options);
  });

  ipcMain.handle('fs:rmdir', async (_, dirPath) => {
    log.info('fs:rmdir', dirPath);
    return fse.rmdir(dirPath, { recursive: true });
  });

  ipcMain.handle('fs:existsSync', async (_, filePath) => {
    log.info('fs:existsSync', filePath);
    return fse.existsSync(filePath);
  });

  ipcMain.handle('fs:createWriteStream', async (_, filePath) => {
    log.info('fs:createWriteStream', filePath);
    // Note: We can't actually return a stream over IPC, but we can ensure
    // the directory exists and return success. Actual streaming should be
    // handled differently (e.g., chunked writes via fs:writeFile or fs:outputFile)
    const dirPath = path.dirname(filePath);
    await fse.mkdirp(dirPath);
    return { path: filePath, ready: true };
  });

  // ===================
  // Path Handlers
  // ===================

  ipcMain.handle('path:join', async (_, ...args) => path.join(...args));

  ipcMain.handle('path:basename', async (_, filePath, ext) => {
    if (ext) {
      return path.basename(filePath, ext);
    }
    return path.basename(filePath);
  });

  ipcMain.handle('path:dirname', async (_, filePath) => path.dirname(filePath));

  ipcMain.handle('path:extname', async (_, filePath) => path.extname(filePath));

  ipcMain.handle('path:parse', async (_, filePath) => path.parse(filePath));

  ipcMain.handle('path:resolve', async (_, ...args) => path.resolve(...args));

  ipcMain.handle('path:normalize', async (_, filePath) => path.normalize(filePath));

  ipcMain.handle('path:relative', async (_, from, to) => path.relative(from, to));

  // ===================
  // Archive Handlers
  // ===================

  ipcMain.handle('archive:create', async (_, sourcePath, destPath) => {
    log.info('archive:create', sourcePath, '->', destPath);
    return new Promise((resolve, reject) => {
      const output = fse.createWriteStream(destPath);
      const zip = archiver('zip', { store: true });

      output.on('close', () => {
        log.info('archive:create complete', destPath);
        resolve(destPath);
      });

      output.on('error', (err) => {
        log.error('archive:create output error', err);
        reject(err);
      });

      zip.on('error', (err) => {
        log.error('archive:create zip error', err);
        reject(err);
      });

      zip.pipe(output);
      zip.directory(sourcePath, false);
      zip.finalize();
    });
  });

  ipcMain.handle('archive:extract', async (_, sourcePath, destPath) => {
    log.info('archive:extract', sourcePath, '->', destPath);
    await decompress(sourcePath, destPath);
    return destPath;
  });

  // ===================
  // Shell Handlers
  // ===================

  ipcMain.handle('shell:openExternal', async (_, url) => {
    log.info('shell:openExternal', url);
    // Validate URL to prevent arbitrary command execution
    const validProtocols = ['http:', 'https:', 'mailto:'];
    const urlObj = new URL(url);
    if (!validProtocols.includes(urlObj.protocol)) {
      throw new Error(`Invalid URL protocol: ${urlObj.protocol}`);
    }
    return shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', async (_, filePath) => {
    log.info('shell:openPath', filePath);
    return shell.openPath(filePath);
  });

  // ===================
  // Window Handlers
  // ===================

  ipcMain.handle('window:hide', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.hide();
    }
  });

  ipcMain.handle('window:show', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.show();
    }
  });

  ipcMain.handle('window:close', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
  });

  ipcMain.handle('window:setFullScreen', async (event, flag) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setFullScreen(flag);
    }
  });

  ipcMain.handle('window:isFullScreen', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      return window.isFullScreen();
    }
    return false;
  });

  // ===================
  // WebFrame Handlers
  // ===================

  ipcMain.handle('webFrame:setVisualZoomLevelLimits', async (event, min, max) => {
    const webContents = event.sender;
    if (webContents) {
      webContents.setVisualZoomLevelLimits(min, max);
    }
  });

  // ===================
  // WebContents Handlers
  // ===================

  ipcMain.handle('webContents:printToPDF', async (event, options) => {
    log.info('webContents:printToPDF', options);
    const pdf = await event.sender.printToPDF(options || {});
    return pdf.toString('base64');
  });

  log.info('IPC handlers registered successfully');
};

/**
 * Remove all IPC handlers (for cleanup)
 */
const removeIpcHandlers = () => {
  const handlers = [
    'dialog:showOpen',
    'dialog:showSave',
    'dialog:showMessageBox',
    'app:getPath',
    'app:getAppPath',
    'app:getVersion',
    'fs:readJson',
    'fs:writeJson',
    'fs:readFile',
    'fs:writeFile',
    'fs:copy',
    'fs:unlink',
    'fs:remove',
    'fs:rename',
    'fs:access',
    'fs:stat',
    'fs:mkdirp',
    'fs:pathExists',
    'fs:readdir',
    'fs:outputFile',
    'fs:mkdir',
    'fs:rmdir',
    'fs:existsSync',
    'fs:createWriteStream',
    'path:join',
    'path:basename',
    'path:dirname',
    'path:extname',
    'path:parse',
    'path:resolve',
    'path:normalize',
    'path:relative',
    'archive:create',
    'archive:extract',
    'shell:openExternal',
    'shell:openPath',
    'window:hide',
    'window:show',
    'window:close',
    'window:setFullScreen',
    'window:isFullScreen',
    'webFrame:setVisualZoomLevelLimits',
    'webContents:printToPDF',
  ];

  handlers.forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
};

module.exports = {
  registerIpcHandlers,
  removeIpcHandlers,
};
