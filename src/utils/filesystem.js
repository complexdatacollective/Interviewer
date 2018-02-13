/* eslint-disable global-require */
/* global FileReader, window, cordova */

import { trimChars } from 'lodash/fp';
import environments from './environments';
import inEnvironment from './Environment';

const Buffer = require('buffer/').Buffer;

const trimPath = trimChars('/ ');

const splitUrl = (targetPath) => {
  const pathParts = trimPath(targetPath).split('/');
  const baseDirectory = `${pathParts.slice(0, -1).join('/')}/`;
  const directory = `${pathParts.slice(-1)}/`;
  return [baseDirectory, directory];
};

const inSequence = (items, apply) =>
  items.reduce(
    (result, item) => result.then(() => apply(item)),
    Promise.resolve(),
  );

const userDataPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = require('electron');

    return () => (electron.app || electron.remote.app).getPath('userData');
  }

  if (environment === environments.CORDOVA) {
    return () => 'cdvfile://localhost/persistent';
  }

  throw new Error(`userDataPath() not available on platform ${environment}`);
});

const appPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = require('electron');

    return () => (electron.app || electron.remote.app).getAppPath();
  }

  if (environment === environments.CORDOVA) {
    return () => cordova.file.applicationDirectory;
  }

  throw new Error(`appDataPath() not available on platform ${environment}`);
});

const resolveFileSystemUrl = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    return path =>
      new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(path, resolve, reject);
      });
  }

  throw new Error(`resolveFileSystemUrl() not available on platform ${environment}`);
});

const readFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return filename =>
      new Promise((resolve, reject) => {
        fs.readFile(filename, null, (err, data) => {
          if (err) { reject(err); }
          resolve(data);
        });
      });
  }

  if (environment === environments.CORDOVA) {
    const fileReader = fileEntry =>
      new Promise((resolve, reject) => {
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = (event) => {
            resolve(Buffer.from(event.target.result));
          };

          reader.onerror = error => reject(error);

          reader.readAsArrayBuffer(file);
        }, reject);
      });

    return filename =>
      resolveFileSystemUrl(filename)
        .then(fileReader);
  }

  throw new Error(`readFile() not available on platform ${environment}`);
});

const readFileAsDataUrl = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    const fileReader = fileEntry =>
      new Promise((resolve, reject) => {
        if (!fileEntry) { reject('File not found'); }
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = (event) => {
            resolve(event.target.result);
          };

          reader.onerror = error => reject(error, 'filesystem.readFileAsDataUrl');

          reader.readAsDataURL(file);
        }, reject);
      });

    return filename =>
      resolveFileSystemUrl(filename)
        .then(fileReader);
  }

  throw new Error(`readFileAsDataUrl() not available on platform ${environment}`);
});

const writeFile = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    const makeFileWriter = fileEntry =>
      new Promise((resolve, reject) => {
        fileEntry.createWriter(resolve, reject);
      });

    const newFile = (directoryEntry, filename) =>
      new Promise((resolve, reject) => {
        directoryEntry.getFile(filename, { create: true }, resolve, reject);
      });

    return (fileUrl, data) => {
      const [baseDirectory, filename] = splitUrl(fileUrl);

      return resolveFileSystemUrl(baseDirectory)
        .then(directoryEntry => newFile(directoryEntry, filename))
        .then(makeFileWriter)
        .then(fileWriter =>
          new Promise((resolve, reject) => {
            fileWriter.onwriteend = () => resolve(fileUrl); // eslint-disable-line no-param-reassign
            fileWriter.onerror = error => reject(error); // eslint-disable-line no-param-reassign
            fileWriter.write(data);
          }),
        );
    };
  }

  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return (filePath, data) =>
      new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (error) => {
          if (error) { reject(error); }
          resolve(filePath);
        });
      });
  }

  throw new Error(`writeFile() not available on platform ${environment}`);
});

const createDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return targetPath =>
      new Promise((resolve, reject) => {
        try {
          fs.mkdir(targetPath, () => {
            resolve(targetPath);
          });
        } catch (error) {
          if (error.code !== 'EEXISTS') { reject(error); }
          throw error;
        }
      });
  }

  if (environment === environments.CORDOVA) {
    const appendDirectory = (directoryEntry, directoryToAppend) =>
      new Promise((resolve, reject) => {
        directoryEntry.getDirectory(
          directoryToAppend,
          { create: true },
          resolve,
          reject,
        );
      });

    return (targetUrl) => {
      const [baseDirectory, directoryToAppend] = splitUrl(targetUrl);

      return resolveFileSystemUrl(baseDirectory)
        .then(directoryEntry => appendDirectory(directoryEntry, directoryToAppend));
    };
  }

  throw new Error(`createDirectory() not available on platform ${environment}`);
});

const removeDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const rimraf = require('rimraf');
    return targetPath =>
      new Promise((resolve, reject) => {
        try {
          if (!targetPath.includes(userDataPath())) { reject('Path not in userDataPath'); return; }
          rimraf(targetPath, resolve);
        } catch (error) {
          if (error.code !== 'EEXISTS') { reject(error); }
          throw error;
        }
      });
  }

  if (environment === environments.CORDOVA) {
    const removeRecursively = directoryEntry =>
      new Promise((resolve, reject) => {
        directoryEntry.removeRecursively(resolve, reject);
      });

    // If folder doesn't exist that's fine
    const ignoreMissingEntry = e => (
      e.code === FileError.NOT_FOUND_ERR ?
        Promise.resolve() :
        Promise.reject(e)
    );

    return targetUrl =>
      resolveFileSystemUrl(targetUrl)
        .then(removeRecursively)
        .catch(ignoreMissingEntry);
  }

  throw new Error(`removeDirectory() not available on platform ${environment}`);
});

const getNestedPaths = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return targetPath =>
      targetPath
        .split(path.sep)
        .reduce(
          (memo, dir) => (
            memo.length === 0 ?
              [dir] :
              [...memo, path.join(memo[memo.length - 1], dir)]
          ),
          [],
        );
  }

  if (environment === environments.CORDOVA) {
    // Only tested for cdvfile:// format paths
    return (targetUrl) => {
      const pathMatcher = /^([a-z]+:\/\/[a-z]+\/[a-z]+\/)(.*)/;
      const matches = pathMatcher.exec(targetUrl);

      const location = matches[1];
      const path = trimPath(matches[2]).split('/');

      return path
        .reduce(
          (memo, dir) => (
            memo.length === 0 ?
              [dir] :
              [...memo, `${memo[memo.length - 1]}${dir}/`]
          ),
          [location],
        )
        .slice(1);
    };
  }

  throw new Error(`getNestedPaths() not available on platform ${environment}`);
});

const writeStream = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return (destination, stream) =>
      new Promise((resolve, reject) => {
        try {
          stream
            .pipe(fs.createWriteStream(destination))
            .on('error', reject)
            .on('finish', () => {
              resolve(destination);
            });
        } catch (error) {
          reject(error);
        }
      });
  }

  throw new Error(`writeStream() not available on platform ${environment}`);
});

const ensurePathExists = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (targetPath) => {
      const relativePath = path.relative(userDataPath(), targetPath);
      const nestedPaths = getNestedPaths(relativePath)
        .map(pathSegment => path.join(userDataPath(), pathSegment));

      return inSequence(
        nestedPaths,
        createDirectory,
      );
    };
  }

  if (environment === environments.CORDOVA) {
    return targetUrl =>
      inSequence(
        getNestedPaths(targetUrl),
        createDirectory,
      );
  }

  throw new Error(`ensurePathExists() not available on platform ${environment}`);
});

export {
  userDataPath,
  appPath,
  getNestedPaths,
  ensurePathExists,
  removeDirectory,
  readFile,
  readFileAsDataUrl,
  writeFile,
  writeStream,
  inSequence,
};
