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

const inSequence = promises =>
  promises.reduce(
    (memo, promise) => memo.then(promise),
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
        window.resolveLocalFileSystemURL(path, resolve, reject);
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
    const fileReader = fileEntry =>
      new Promise((resolve, reject) => {
        fileEntry.file((file) => {
          const reader = new FileReader();

          reader.onloadend = (event) => {
            resolve(Buffer.from(event.target.result));
          };

          reader.readAsArrayBuffer(file);
        }, reject);
      });

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
        directoryEntry.getFile(filename, { create: true, exclusive: false }, resolve, reject);
      });

    return (fileUrl, data) => {
      const [baseDirectory, filename] = splitUrl(fileUrl);

      return resolveFileSystemUrl(baseDirectory)
        .then(directoryEntry => newFile(directoryEntry, filename))
        .then(makeFileWriter)
        .then(fileWriter =>
          new Promise((resolve, reject) => {
            fileWriter.onwriteend = () => resolve(); // eslint-disable-line no-param-reassign
            fileWriter.onerror = () => reject(); // eslint-disable-line no-param-reassign
            fileWriter.write(data);
          }),
        );
    };
  }

  throw new Error();
});

const mkDir = inEnvironment((environment) => {
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
        directoryEntry.getDirectory(directoryToAppend, { create: true }, resolve, reject);
      });

    return (targetUrl) => {
      const [baseDirectory, directoryToAppend] = splitUrl(targetUrl);

      return resolveFileSystemUrl(baseDirectory).then(
        directoryEntry =>
          appendDirectory(directoryEntry, directoryToAppend),
      );
    };
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
          .map(pathSegment => mkDir(path.join(userDataPath(), pathSegment))),
      ).then(() => targetPath);
    };
  }

  if (environment === environments.CORDOVA) {
    return targetUrl =>
      inSequence(
        getNestedPaths(targetUrl)
          .map(pathSegment => mkDir(pathSegment)),
      ).then(() => targetUrl);
  }

  throw new Error();
});

window.userDataPath = userDataPath;
window.getNestedPaths = getNestedPaths;
window.ensurePathExists = ensurePathExists;
window.readFile = readFile;
window.readFileAsDataUrl = readFileAsDataUrl;
window.writeFile = writeFile;
window.writeStream = writeStream;

export {
  userDataPath,
  getNestedPaths,
  ensurePathExists,
  readFile,
  readFileAsDataUrl,
  writeFile,
  writeStream,
};
