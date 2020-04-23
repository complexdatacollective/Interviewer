import path from 'path';
import { isElectron, isCordova } from './Environment';
import { archive } from './archive';
import GraphMLFormatter from './network-exporters/graphml/GraphMLFormatter';

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
  let shareURL;
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
      .then(({ fileWriter, filename, fileURL }) => {
        shareURL = fileURL;
        return writeFile(fileWriter, filename, data, fileType);
      })
      .then(filename => resolve({ filename, fileEntry, shareURL }))
      .catch(err => reject(err));
  });
};

const cordovaShare = (shareURL, shareOptions) => {
  const options = {
    message: 'Your zipped network canvas data.', // not supported on some apps
    subject: 'network canvas export',
    files: [shareURL],
    chooserTitle: 'Share zip file via', // Android only
    ...shareOptions,
  };
  return new Promise(res =>
    window.plugins.socialsharing.shareWithOptions(options, () => res(shareURL), () => res('cancelled')));
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
          const sessionCodebook = installedProtocols[session.protocolUID].codebook;

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
      .then(shareURL => cordovaShare(shareURL, shareOptions))
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

const exportElectronFile = (fs, session, sessionCodebook, dataFileName) => {
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
    // eslint-disable-next-line consistent-return
    }, (filename) => {
      if (filename === undefined) resolve('cancelled');

      const promisedExports = exportedSessionIds.map((sessionId) => {
        const session = sessions[sessionId];
        const sessionCodebook = installedProtocols[session.protocolUID].codebook;
        const dataFileName = path.join(tempPath, `${session.caseId}_${sessionId}.graphml`);

        // export one file at a time
        return exportElectronFile(fs, session, sessionCodebook, dataFileName);
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

const saveFile = (exportedSessionIds, sessions, installedProtocols) => {
  if (exportedSessionIds.length > 1) { // when cvs is possible, it should zip too
    return saveZippedSessions(exportedSessionIds, sessions, installedProtocols);
  }

  // export single file
  const sessionId = exportedSessionIds[0];
  const session = sessions[sessionId];
  const sessionCodebook = installedProtocols[session.protocolUID].codebook;

  if (isElectron()) {
    const fs = window.require('fs');
    const { dialog, shell } = window.require('electron').remote;

    return new Promise((resolve, reject) => {
      dialog.showSaveDialog({
        filters: [{ name: 'graphml', extensions: ['graphml'] }],
        defaultPath: `${session.caseId}_${sessionId}.graphml`,
      // eslint-disable-next-line consistent-return
      }, (filename) => {
        if (filename === undefined) resolve('cancelled');
        exportElectronFile(fs, session, sessionCodebook, filename)
          .then(exportedFilename => shell.showItemInFolder(exportedFilename))
          .then(resolve)
          .catch(err => reject(err));
      });
    });
  } else if (isCordova()) {
    return getFileSystem()
      .then(fileSystem => exportCordovaFile(fileSystem, session, sessionId, sessionCodebook, 'text/xml'))
      .then(({ shareURL }) => cordovaShare(
        shareURL, { message: 'Your network canvas graphml file.', chooserTitle: 'Share graphml file via' }));
  }

  return Promise.reject('Export not supported on this platform.');
};

export default saveFile;

export { saveZippedSessions };
