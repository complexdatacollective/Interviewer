const { app, BrowserWindow } = require('electron');
const { join } = require('path');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.js')
    }
  })

  // win.loadFile('index.html')
  win.loadURL('http://localhost:3001')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})