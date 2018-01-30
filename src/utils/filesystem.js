/* eslint-disable global-require */
/* global FileReader, window */

import { trimChars } from 'lodash/fp';
import environments from './environments';
import inEnvironment from './Environment';

const Buffer = require('buffer/').Buffer;

const trimPath = trimChars('/ ');

const splitUrl = (targetPath) => {
  const pathParts = targetPath.split('/');
  const baseDirectory = pathParts.slice(0, -1).join('/');
  const [tail] = pathParts.slice(-1);
  return [baseDirectory, tail];
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

  throw new Error();
});

const resolveFileSystemUrl = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    return path =>
      new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(path, resolve, error => reject(error, 'filesystem.resolveFileSystemUrl'));
      });
  }

  throw new Error();
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
    const fileReader = (fileEntry) => {
      return new Promise((resolve, reject) => {
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = (event) => {
            resolve(Buffer.from(event.target.result));
          };

          reader.readAsArrayBuffer(file);
        }, reject);
      });
    }

    return filename =>
      resolveFileSystemUrl(filename)
        .then(fileReader);
  }

  throw new Error();
});

const readFileAsDataUrl = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    const fileReader = fileEntry =>
      new Promise((resolve, reject) => {
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = (event) => {
            resolve(event.target.result);
          };

          reader.readAsDataURL(file);
        }, reject);
      });

    return filename =>
      resolveFileSystemUrl(filename)
        .then(fileReader);
  }

  throw new Error();
});

const writeFile = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    const makeFileWriter = fileEntry =>
      new Promise((resolve, reject) => {
        fileEntry.createWriter(resolve, reject);
      });

    const newFile = (directoryEntry, filename) =>
      new Promise((resolve, reject) => {
        directoryEntry.getFile(filename, { create: true }, resolve, error => reject(error, 'filesystem.writeFile'));
      });

    return (fileUrl, data) => {
      const [baseDirectory, filename] = splitUrl(fileUrl);

      return resolveFileSystemUrl(baseDirectory)
        .then(directoryEntry => newFile(directoryEntry, filename))
        .then(makeFileWriter)
        .then(fileWriter =>
          new Promise((resolve, reject) => {
            fileWriter.onwriteend = () => resolve(); // eslint-disable-line no-param-reassign
            fileWriter.onerror = error => reject(error, 'filesystem.writeFile.fileWriter'); // eslint-disable-line no-param-reassign
            fileWriter.write(data);
          }),
        );
    };
  }

  throw new Error();
});

const createDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return targetPath =>
      new Promise((resolve, reject) => {
        fs.mkdir(targetPath, (err) => {
          if (err) { reject(err); }
          resolve(targetPath);
        });
      });
  }

  if (environment === environments.CORDOVA) {
    const appendDirectory = (directoryEntry, directoryToAppend) =>
      new Promise((resolve, reject) => {
        directoryEntry.getDirectory(
          directoryToAppend,
          { create: true },
          resolve,
          error => reject(error, 'filesystem.createDirectory.appendDirectory'),
        );
      });

    return (targetUrl) => {
      const [baseDirectory, directoryToAppend] = splitUrl(targetUrl);

      return resolveFileSystemUrl(baseDirectory)
        .then(directoryEntry => appendDirectory(directoryEntry, directoryToAppend));
    };
  }

  throw new Error();
});

const removeDirectory = inEnvironment((environment) => {
  if (environment === environments.CORDOVA) {
    const removeRecursively = directoryEntry =>
      new Promise((resolve, reject) => {
        directoryEntry.removeRecursively(resolve, error => reject(error, 'filesystem.removeDirectory.removeRecursively'));
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

  throw new Error();
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
    // Only works for cdvfile:// format paths
    return (targetUrl) => {
      const url = new URL(targetUrl);

      const path = trimPath(url.pathname).split('/');

      return path
        .slice(1)
        .reduce(
          (memo, dir) => (
            memo.length === 0 ?
              [dir] :
              [...memo, `${memo[memo.length - 1]}/${dir}`]
          ),
          [`${url.protocol}//${url.hostname}/${path[0]}`],
        )
        .slice(1);
    };
  }

  throw new Error();
});

const writeStream = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return (destination, stream) =>
      new Promise((resolve, reject) => {
        stream
          .pipe(fs.createWriteStream(destination))
          .on('error', (err) => {
            reject(destination, err);
          })
          .on('finish', () => {
            resolve(destination);
          });
      });
  }

  return () => Promise.reject('Environment not recognised');
});

const ensurePathExists = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (targetPath) => {
      const relativePath = path.relative(userDataPath(), targetPath);

      return inSequence(
        getNestedPaths(relativePath)
          .map(pathSegment => createDirectory(path.join(userDataPath(), pathSegment))),
      ).then(() => targetPath);
    };
  }

  if (environment === environments.CORDOVA) {
    return targetUrl =>
      inSequence(
        getNestedPaths(targetUrl),
        createDirectory,
      );
  }

  throw new Error();
});

// TODO: remove these debug exports
window.userDataPath = userDataPath;
window.getNestedPaths = getNestedPaths;
window.ensurePathExists = ensurePathExists;
window.readFile = readFile;
window.removeDirectory = removeDirectory;
window.readFileAsDataUrl = readFileAsDataUrl;
window.writeFile = writeFile;
window.writeStream = writeStream;
window.createDirectory = createDirectory;
window.resolveFileSystemUrl = resolveFileSystemUrl;

export {
  userDataPath,
  getNestedPaths,
  ensurePathExists,
  removeDirectory,
  readFile,
  readFileAsDataUrl,
  writeFile,
  writeStream,
  inSequence,
};
