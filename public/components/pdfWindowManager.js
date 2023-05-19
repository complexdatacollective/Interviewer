const { BrowserWindow } = require('electron');

function openPdfWindow(sessionData, filepath) {
  console.log('session data from pdfWindowManager', sessionData, filepath);
  // create new browser window
  const pdfWindow = new BrowserWindow({
    parent: global.appWindow,
    modal: true,
    // show: false hides window
    show: true,
    webPreferences: { nodeIntegration: true },
    height: 900,
    width: 1024,
    menuBarVisible: false,
  });

  // TODO: get url for dev or prod
  pdfWindow.loadURL('http://localhost:3001/#/pdfview');

  // send sessiondata to pdfWindow after load
  pdfWindow.webContents.on('did-finish-load', () => {
    pdfWindow.webContents.send('PDF_DATA', sessionData, filepath);
  });
  console.log(pdfWindow.webContents.getURL());
}

const pdfWindowManager = {
  createPdfWindow: function createPdfWindow(sessionData, filepath) {
    return openPdfWindow(sessionData, filepath);
  },
};

module.exports = pdfWindowManager;
