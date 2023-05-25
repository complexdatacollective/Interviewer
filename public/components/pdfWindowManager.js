/* eslint-disable @codaco/spellcheck/spell-checker */
const { BrowserWindow, ipcMain } = require('electron');
const { writeFile } = require('fs-extra');
const path = require('path');
const { queue } = require('async');
const sanitize = require('sanitize-filename');
const appUrl = require('./appURL');

let pdfWindow = null;

// Create a single reusable browser window to save resources and loading time.
const createWindow = async () => {
  if (pdfWindow) {
    throw new Error('pdf window already exists!');
  }

  console.log('Creating PDF export window...');
  let ready = false;

  // Wait for the window to send back the 'ready' event via IPC, then print to PDF
  ipcMain.once('PDF_READY', async () => {
    ready = true;
  });

  pdfWindow = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: true },
    height: 900,
    width: 1024,
  });

  if (process.env.NODE_ENV === 'development') {
    pdfWindow.webContents.openDevTools();
  }

  // Await the load URL. Same as binding to 'did-finish-loading'.
  await pdfWindow.loadURL(`${appUrl}/#/export`);

  let interval;

  await new Promise((resolve) => {
    interval = setInterval(() => {
      if (ready) {
        console.log('Ready!');
        resolve();
      }
    }, 100);
  });

  clearInterval(interval);

  console.log('Window created.');
};

/**
 * Async function that handles processing a single session.
 */
const printQueueHandler = async ({ path: filePath, data, caseId }) => {
  console.log('Handling queue item', filePath);

  // We need to wait for the PDF_HAS_DATA message before calling printToPDF
  // to ensure that the component has rendered.
  let readyToPrint = false; // Set a flag

  // Establish an event listener which toggles the flag
  ipcMain.once('PDF_HAS_DATA', () => {
    console.log('Ready to print!');
    readyToPrint = true;
  });

  // Send a single session to the window to render. This will trigger the PDF_HAS_DATA
  // message.
  pdfWindow.webContents.send('PDF_DATA', { [caseId]: data });

  // Set up an interval to poll for the message having been received.
  let interval;
  await new Promise((resolve) => {
    interval = setInterval(() => {
      if (readyToPrint) {
        resolve();
      }
    }, 100);
  });

  // Clear the interval
  clearInterval(interval);

  // Finally, we can safely call the printToPDF method!
  const pdfData = await pdfWindow.webContents.printToPDF({});

  // write PDF to file
  try {
    await writeFile(filePath, pdfData);
  } catch (error) {
    console.log('Error printing PDF:', error);
    throw error;
  }

  console.log('Done handling queue item', filePath);
};

// Create a queue, with our handler attached.
const printQueue = queue(printQueueHandler);

/**
 * Given a sessionData object and a filepath:
 * 1. Create a new browser window (if one doesn't exist)
 * 2. Send the sessionData to the window via IPC
 * 3. Wait for the window to send back the 'ready' event via IPC, then print to PDF
 * 4. Write the PDF to the filepath
 * 5. Close the window
 *
 * @param {*} sessionData
 * @param {*} filepath
 * @returns
 */

async function doPDFWindowWrite(sessionData, filepath) {
  // create new browser window
  if (!pdfWindow) {
    await createWindow();
  }

  Object.entries(sessionData).forEach(([caseId, data]) => {
    // Set a safe pathname
    const safepath = path.join(filepath, `${sanitize(caseId)}.pdf`);
    console.log('Pushing to queue', safepath);
    printQueue.push({ path: safepath, data, caseId });
  });

  console.log('Draining queue...');
  await printQueue.drain();

  console.log('Queue drained');
  // Close the window
  pdfWindow.close();
  pdfWindow = null;
}

module.exports = doPDFWindowWrite;
