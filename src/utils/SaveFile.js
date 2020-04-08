import path from 'path';
import { isElectron, isCordova } from './Environment';
import { archive } from './archive';
import GraphMLFormatter from './network-exporters/graphml/GraphMLFormatter';

const saveFile = (data, openErrorDialog, filterName, extensions, defaultFileName, fileType,
  shareOptions) => {
  const defaultFilePrefix = path.basename(defaultFileName, '.graphml');
  if (isElectron()) { // electron save dialog
    // eslint-disable-next-line global-require
    const electron = require('electron');
    const fs = window.require('fs');
    const { dialog, shell } = window.require('electron').remote;
    const tempPath = (electron.app || electron.remote.app).getPath('temp');
    const dataFileName = path.join(tempPath, defaultFileName);

    const unlink = filePath => (new Promise((resolve, reject) => {
      try {
        fs.unlink(filePath, (err, ...args) => {
          if (err) {
            reject(err);
          } else {
            resolve(...args);
          }
        });
      } catch (err) { reject(err); }
    }));

    dialog.showSaveDialog({
      filters: [{ name: 'zip', extensions: ['zip'] }],
      defaultPath: `${defaultFilePrefix}.zip`,
    }, (filename) => {
      if (filename === undefined) return;
      const dataFilePromise = new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(dataFileName);
        writeStream.on('finish', () => resolve(dataFileName));
        writeStream.on('error', err => reject(err));
        writeStream.write(data);
        writeStream.end();
      });

      Promise.all([dataFilePromise])
        .then(savedDataFile => archive(savedDataFile, filename))
        .then(() => unlink(dataFileName))
        .then(() => shell.showItemInFolder(filename))
        .catch(err => openErrorDialog(err));
    });
  } else if (isCordova()) { // cordova save
    const getFileSystem = () => new Promise((resolve, reject) => {
      window.requestFileSystem(
        window.LocalFileSystem.TEMPORARY,
        5 * 1024 * 1024,
        fileSystem => resolve(fileSystem),
        err => reject(err),
      );
    });

    const getFile = (filename, fileSystem) => new Promise((resolve, reject) => {
      fileSystem.root.getFile(filename, { create: true, exclusive: false },
        fileEntry => resolve(fileEntry),
        err => reject(err),
      );
    });

    const createWriter = fileEntry => new Promise((resolve, reject) => {
      fileEntry.createWriter(
        fileWriter => resolve({
          fileWriter,
          filename: fileEntry.fullPath,
          fileURL: fileEntry.toURL(),
        }),
        err => reject(err),
      );
    });

    const writeFile = (fileWriter, filename) => new Promise((resolve, reject) => {
      const blob = new Blob([data], { type: fileType });
      fileWriter.seek(0);
      fileWriter.onwrite = () => resolve(filename); // eslint-disable-line no-param-reassign
      fileWriter.onerror = err => reject(err); // eslint-disable-line no-param-reassign
      fileWriter.write(blob);
    });

    let fileSystem;
    let fileEntry;
    let dataFilename;
    getFileSystem()
      .then((fs) => {
        fileSystem = fs;
        return getFile(defaultFileName, fs);
      })
      .then((fe) => {
        fileEntry = fe;
        return createWriter(fileEntry);
      })
      .then(({ fileWriter, filename }) => {
        dataFilename = filename;
        return writeFile(fileWriter, filename);
      })
      .then(() => getFile(`${defaultFilePrefix}.zip`, fileSystem))
      .then(fe => createWriter(fe))
      .then(({ fileWriter, fileURL }) =>
        archive([dataFilename], fileURL, fileWriter, fileSystem))
      .then((shareURL) => {
        const options = {
          message: 'Your network canvas file.', // not supported on some apps
          subject: 'network canvas export',
          files: [shareURL],
          chooserTitle: 'Share file via', // Android only
          ...shareOptions,
        };
        window.plugins.socialsharing.shareWithOptions(options);
      })
      .catch(err => openErrorDialog(err));
  } else { // browser save to downloads
    const blob = new Blob([data], { type: fileType });
    const element = document.createElement('a');
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', defaultFileName);
    element.style.display = 'none';
    document.getElementById('root').appendChild(element);
    element.click();
    document.getElementById('root').removeChild(element);
    window.URL.revokeObjectURL(blob);
  }
};


const getFileSystem = () => new Promise((resolve, reject) => {
  window.requestFileSystem(
    window.LocalFileSystem.TEMPORARY,
    5 * 1024 * 1024,
    fileSystem => resolve(fileSystem),
    err => reject(err),
  );
});

const getFile = (filename, fileSystem) => new Promise((resolve, reject) => {
  fileSystem.root.getFile(filename, { create: true, exclusive: false },
    fileEntry => resolve(fileEntry),
    err => reject(err),
  );
});

const createWriter = fileEntry => new Promise((resolve, reject) => {
  fileEntry.createWriter(
    fileWriter => resolve({
      fileWriter,
      filename: fileEntry.fullPath,
      fileURL: fileEntry.toURL(),
    }),
    err => reject(err),
  );
});

const writeFile = (fileWriter, filename, data, fileType) => new Promise((resolve, reject) => {
  const blob = new Blob([data], { type: fileType });
  fileWriter.seek(0);
  fileWriter.onwrite = () => resolve(filename); // eslint-disable-line no-param-reassign
  fileWriter.onerror = err => reject(err); // eslint-disable-line no-param-reassign
  fileWriter.write(blob);
  return filename;
});

const exportCordovaFile = (fs, session, sessionId, sessionCodebook, fileType) => {
  let data;
  let fileEntry;
  const formatter = new GraphMLFormatter(session.network, false, false, sessionCodebook);
  return new Promise((resolve, reject) => {
    formatter.writeToString()
      .then((value) => {
        data = value;
        return getFile(`${session.caseId}_${sessionId}.graphml`, fs);
      })
      .then((fe) => {
        fileEntry = fe;
        return createWriter(fe);
      })
      .then(({ fileWriter, filename }) => writeFile(fileWriter, filename, data, fileType))
      .then(filename => resolve({ filename, fileEntry }))
      .catch(err => reject(err));
  });
};

const tryFileCleanup = (fileEntries) => {
  if (fileEntries) {
    fileEntries.map((fileEntry) => {
      try {
        return fileEntry.remove();
      } catch (err) { return err; }
    });
  }
};

const saveZippedSessionsCordova = (exportedSessionIds, sessions, installedProtocols) => {
  const defaultFileName = 'networkCanvasExport.zip';
  const fileType = 'text/xml';
  const shareOptions = { message: 'Your network canvas zip file.', subject: 'network canvas export' };

  let fileSystem;
  let dataFilenames;
  let fileEntries;
  return new Promise((resolve, reject) => {
    getFileSystem()
      .then((fs) => {
        fileSystem = fs;
        const promisedExports = exportedSessionIds.map((sessionId) => {
          const session = sessions[sessionId];
          const sessionProtocolUID = session.protocolUID;
          const sessionCodebook = installedProtocols[sessionProtocolUID].codebook;

          // export one file at a time
          return exportCordovaFile(fs, session, sessionId, sessionCodebook, fileType);
        });
        // collect exported temp file names
        return Promise.all(promisedExports);
      })
      .then((files) => {
        dataFilenames = files.map(file => file.filename);
        fileEntries = files.map(file => file.fileEntry);
        return getFile(defaultFileName, fileSystem);
      })
      .then(fe => createWriter(fe))
      .then(({ fileWriter, fileURL }) => archive(dataFilenames, fileURL, fileWriter, fileSystem))
      .then((shareURL) => {
        const options = {
          message: 'Your network canvas file.', // not supported on some apps
          subject: 'network canvas export',
          files: [shareURL],
          chooserTitle: 'Share file via', // Android only
          ...shareOptions,
        };
        return new Promise((res, rej) =>
          window.plugins.socialsharing.shareWithOptions(options, res, rej));
      })
      .then(() => tryFileCleanup(fileEntries))
      .then(() => resolve(dataFilenames))
      .catch(err => reject(err));
  });
};

const tryUnlink = (filePath, fs) => (new Promise((resolve) => {
  try {
    fs.unlink(filePath, (err, ...args) => {
      if (err) {
        resolve(err);
      } else {
        resolve(...args);
      }
    });
  } catch (err) { resolve(err); }
}));

const exportElectronFile = (fs, session, sessionId, sessionCodebook, tempPath) => {
  const dataFileName = path.join(tempPath, `${session.caseId}_${sessionId}.graphml`);
  const formatter = new GraphMLFormatter(session.network, false, false, sessionCodebook);

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(dataFileName);
    writeStream.on('finish', () => resolve(dataFileName));
    writeStream.on('error', err => reject(err));
    formatter.writeToStream(writeStream);
  });
};

const saveZippedSessionsElectron = (exportedSessionIds, sessions, installedProtocols) => {
  // eslint-disable-next-line global-require
  const electron = require('electron');
  const fs = window.require('fs');
  const { dialog, shell } = window.require('electron').remote;
  const tempPath = (electron.app || electron.remote.app).getPath('temp');

  const defaultFileName = 'networkCanvasExport.zip';

  return new Promise((resolve, reject) => {
    dialog.showSaveDialog({
      filters: [{ name: 'zip', extensions: ['zip'] }],
      defaultPath: defaultFileName,
    }, (filename) => {
      if (filename === undefined) return;

      const promisedExports = exportedSessionIds.map((sessionId) => {
        const session = sessions[sessionId];
        const sessionProtocolUID = session.protocolUID;
        const sessionCodebook = installedProtocols[sessionProtocolUID].codebook;

        // export one file at a time
        return exportElectronFile(fs, session, sessionId, sessionCodebook, tempPath);
      });

      let dataFileNames;
      Promise.all(promisedExports)
        .then((savedDataFile) => {
          dataFileNames = savedDataFile;
          return archive(savedDataFile, filename);
        })
        .then(() => dataFileNames.map(dataFileName => tryUnlink(dataFileName, fs)))
        .then(() => shell.showItemInFolder(filename))
        .then(resolve)
        .catch(err => reject(err));
    });
  });
};

const saveZippedSessions = (exportedSessionIds, sessions, installedProtocols) => {
  if (isElectron()) { // electron save dialog
    return saveZippedSessionsElectron(exportedSessionIds, sessions, installedProtocols);
  } else if (isCordova()) {
    return saveZippedSessionsCordova(exportedSessionIds, sessions, installedProtocols);
  }

  return Promise.reject('Export not supported on this platform.');
};

export default saveFile;

export { saveZippedSessions };
