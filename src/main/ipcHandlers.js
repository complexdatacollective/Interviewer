/**
 * IPC Handlers for Network Canvas main process.
 * Registers all ipcMain.handle() handlers for secure IPC communication.
 *
 * These handlers replace direct Node.js access in the renderer process,
 * providing a controlled API for file system, dialogs, and other operations.
 */

import { randomUUID } from 'node:crypto';
import path from 'node:path';

import archiver from 'archiver';
import decompress from 'decompress';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fse from 'fs-extra';

import log from './log.js';

/**
 * Resolve `target` and require it to be inside the app's temp or userData
 * directory before a destructive filesystem operation, mirroring the allowlist
 * in network-exporters' `removeDirectory`. Throws otherwise.
 */
const assertUnderSafeRoot = (target, op) => {
  const resolved = path.resolve(target);
  const roots = [app.getPath('temp'), app.getPath('userData')];
  const allowed = roots.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep),
  );
  if (!allowed) {
    throw new Error(
      `Refusing to ${op} outside the app's temp/userData directories: ${target}`,
    );
  }
  return resolved;
};

/**
 * Register all IPC handlers
 */
export const registerIpcHandlers = () => {
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
  // Protocol Download (runs in main to avoid renderer CORS)
  // ===================

  ipcMain.handle('protocol:download', async (_, uri) => {
    const url = new URL(uri);
    // Only http(s); reject other schemes (file:, etc.) and embedded
    // credentials (so they are never fetched or written to the log).
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`Unsupported protocol for download: ${url.protocol}`);
    }
    if (url.username || url.password) {
      throw new Error('Credentials are not allowed in a protocol download URL');
    }
    // Log origin + path only (no credentials or query string).
    log.info('protocol:download', `${url.origin}${url.pathname}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(
          `Failed to download protocol (HTTP ${response.status})`,
        );
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const destination = path.join(app.getPath('temp'), randomUUID());
      await fse.writeFile(destination, buffer);
      return destination;
    } finally {
      clearTimeout(timeout);
    }
  });

  // ===================
  // App Info Handlers
  // ===================

  ipcMain.handle('app:getPath', async (_, name) => {
    const validPaths = [
      'home',
      'appData',
      'userData',
      'temp',
      'desktop',
      'documents',
      'downloads',
    ];
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

  ipcMain.handle('fs:readFile', async (_, filePath, encoding) => {
    log.info('fs:readFile', filePath);
    if (encoding) {
      return fse.readFile(filePath, encoding);
    }
    // Return as base64 for binary files
    const buffer = await fse.readFile(filePath);
    return buffer.toString('base64');
  });

  ipcMain.handle('fs:writeFile', async (_, filePath, data, isBinary) => {
    log.info('fs:writeFile', filePath);
    // Explicit binary flag from the renderer is authoritative (any size).
    if (isBinary) {
      return fse.writeFile(filePath, Buffer.from(data, 'base64'));
    }
    // Fallback heuristic for callers that don't set the flag (e.g. streams).
    if (typeof data === 'string' && data.length > 0) {
      const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(data.substring(0, 100));
      if (isBase64 && data.length > 1000) {
        return fse.writeFile(filePath, Buffer.from(data, 'base64'));
      }
    }
    return fse.writeFile(filePath, data);
  });

  ipcMain.handle('fs:rename', async (_, oldPath, newPath) => {
    log.info('fs:rename', oldPath, '->', newPath);
    return fse.rename(oldPath, newPath);
  });

  ipcMain.handle('fs:mkdirp', async (_, dirPath) => {
    log.info('fs:mkdirp', dirPath);
    return fse.mkdirp(dirPath);
  });

  ipcMain.handle('fs:mkdir', async (_, dirPath, options) => {
    log.info('fs:mkdir', dirPath);
    return fse.mkdir(dirPath, options);
  });

  ipcMain.handle('fs:rmdir', async (_, dirPath) => {
    log.info('fs:rmdir', dirPath);
    // Destructive: only allow removing inside the app's temp / userData dirs.
    // `remove` is idempotent (no ENOENT on missing path) and not deprecated.
    return fse.remove(assertUnderSafeRoot(dirPath, 'remove a directory'));
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

  ipcMain.handle('path:normalize', async (_, filePath) =>
    path.normalize(filePath),
  );

  ipcMain.handle('path:relative', async (_, from, to) =>
    path.relative(from, to),
  );

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

  ipcMain.handle(
    'webFrame:setVisualZoomLevelLimits',
    async (event, min, max) => {
      const webContents = event.sender;
      if (webContents) {
        webContents.setVisualZoomLevelLimits(min, max);
      }
    },
  );

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
