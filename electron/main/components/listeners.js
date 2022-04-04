const { ipcMain, dialog } = require('electron');
const fse = require('fs-extra');
const log = require('./log');
const { join, parse } = require('path');
const { commonName } = require('secure-comms-api/sslConfig.js');
const { normalizeEol } = require('../../preload/utils');

module.exports = function registerIPCListeners() {
  ipcMain.on('add-cert', (evt, cert) => {
    global.pretrustedCertificates.add(normalizeEol(cert));
    evt.sender.send('add-cert-complete');
  });

  ipcMain.handle('save-file', async (event, options, data) => {
      // do stuff
      return dialog.showSaveDialog(win, options)
      .then(({ canceled, filePath }) => {
        if (canceled) { return; }
        return parse(filePath);
      })
      .then(async (filePath) => {
        const jsonFilePath = join(filePath.dir, `${filePath.name}.json`);
        await fse.writeFile(jsonFilePath, data, 'utf8');

        return jsonFilePath;
      });
  });

  ipcMain.handle('open-file', (event, path = `${process.cwd()}/complex-example.json`) => {
    return fse.readFile(path, 'utf8')
  });

  ipcMain.handle('open-dialog', (options) => {
    return dialog.showOpenDialog(win, options)
      .then(({ canceled, filePaths, ...rest }) => {
        if (canceled) { return; }

        const filePath = filePaths[0];
        console.log(filePath);
        return filePath;
      });
  });

  ipcMain.handle('save-dialog', async (event, options) => {
    const path = await dialog.showSaveDialog(win, options)
      .then(({ canceled, filePath }) => {
        if (canceled) { return; }

        if (filePath) {
          return filePath;
        }
      });

    return path;
  });
};

module.exports = function registerAppListeners() {
  app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('second-instance', () => {
    if (win) {
      // Focus on the main window if the user tried to open another
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })

  app.on('certificate-error', (event, webContents, requestedUrl, error, certificate, callback) => {
    const protocolMatch = requestedUrl.startsWith('https:');
    const nameMatch = certificate.subject.commonName === commonName;
    const rawCert = normalizeEol(certificate.data);
    if (nameMatch && protocolMatch && global.pretrustedCertificates.has(rawCert)) {
      event.preventDefault();
      callback(true);
    } else {
      log.warn('Unexpected certificate error', requestedUrl);
      log.error(error);
      // Calling `callback(false)` will cancel the request and prevent the error
      // from being given to XHR. With axios, this results in a silent failure.
      // Instead, allow the error to occur by not calling back.
    }
  });
}
