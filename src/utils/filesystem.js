/* eslint-disable global-require */

import environments from './environments';
import inEnvironment from './Environment';

const userDataPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = require('electron');

    return () => (electron.app || electron.remote.app).getPath('userData');
  }

  throw new Error();
});

const readFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return (filename, options = null) =>
      new Promise((resolve, reject) => {
        fs.readFile(filename, options, (err, data) => {
          if (err) { reject(err); }
          resolve(data);
        });
      });
  }

  throw new Error();
});

const copyFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const fs = require('fs');

    return (source, destination) =>
      new Promise((resolve, reject) => {
        const destinationStream = fs.createWriteStream(destination);
        const sourceStream = fs.createReadStream(source);

        destinationStream.on('close', (err) => {
          if (err) { reject(err); }
          resolve(destination);
        });

        sourceStream.pipe(destinationStream);
      });
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

const inSequence = promises =>
  promises.reduce(
    (memo, promise) => memo.then(promise),
    Promise.resolve(),
  );

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

  throw new Error();
});

export {
  ensurePathExists,
  copyFile,
  readFile,
  writeStream,
};
