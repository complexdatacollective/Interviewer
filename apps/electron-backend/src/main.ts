import { app, BrowserWindow } from "electron";
import * as path from "path";

import { waitForServerUp } from "wait-for-server-up";

// TODO: maybe better "production detection"
const isProduction = process.env.NODE_ENV !== "dev";
const FRONTEND_PATH = path.join(__dirname, "../dist-interviewer/");
const localServer = 'http://localhost:3000/';

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    width: 1024,
  });

  if (isProduction) {
    // load bundled React app
    mainWindow.loadFile(path.join(FRONTEND_PATH, "index.html"));
  } else {
    // show loading spinner while local server is ready
    mainWindow.loadFile(path.join(__dirname, "../loading.html"));
    await waitForServerUp(localServer)
    // load locally served React app in dev mode
    mainWindow.loadURL(localServer);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
