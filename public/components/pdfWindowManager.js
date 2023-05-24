const { BrowserWindow, ipcMain } = require('electron');
const { writeFile } = require('fs-extra');
const path = require('path');
const sanitize = require('sanitize-filename');
const appUrl = require('./appURL');

async function doPDFWindowWrite(sessionData, filepath, caseId) {
  return new Promise((resolve, reject) => {
    // create new browser window
    const pdfWindow = new BrowserWindow({
      // show: false hides window
      show: true,
      webPreferences: { nodeIntegration: true },
      height: 900,
      width: 1024,
    });

    if (process.env.NODE_ENV === 'development') {
      pdfWindow.webContents.openDevTools();
    }

    // Load the URL
    pdfWindow.loadURL(`${appUrl}/#/export`);

    // Wait for the window to send back the 'ready' event via IPC, then print to PDF
    ipcMain.on('PDF_READY', () => {
      console.log('ipcMain got PDF_READY');
      pdfWindow.webContents.send('PDF_DATA', sessionData);

      const safepath = path.join(filepath, `${sanitize(caseId)}.pdf`);
      pdfWindow.webContents.printToPDF({}).then((pdf) => {
        // write PDF to file
        writeFile(safepath, pdf, (error) => {
          if (error) {
            console.log('error', error);
            reject(error);
          } else {
            console.log('PDF saved');
            // pdfWindow.close();
            resolve();
          }
        });
      });
    });
  });
}

module.exports = doPDFWindowWrite;
