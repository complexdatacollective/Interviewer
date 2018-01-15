import inEnvironment, { environments } from './Environment';

const userDataPath = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');

    return (electron.app || electron.remote.app).getPath('userData');
  }

  throw Error(`userDataPath not defined for this environment (${environment})`);
});

const readFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const fs = electron.remote.require('fs');

    return (filename, options = null) =>
      new Promise((resolve, reject) => {
        fs.readFile(filename, options, (err, data) => {
          if (err) { reject(err); }
          resolve(data);
        });
      });
  }

  throw Error(`readFile not defined for this environment (${environment})`);
});

const copyFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const fs = electron.remote.require('fs');

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

  throw Error(`copyFile not defined for this environment (${environment})`);
});

const mkDir = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const fs = electron.remote.require('fs');

    return targetPath =>
      new Promise((resolve, reject) => {
        fs.mkdir(targetPath, (err) => {
          if (err) { reject(err); }
          resolve(targetPath);
        });
      });
  }

  throw Error(`mkDir not defined for this environment (${environment})`);
});

const getNestedPaths = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const path = electron.remote.require('path');

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

  throw Error(`getNestedPaths not defined for this environment (${environment})`);
});

const inSequence = promises =>
  promises.reduce(
    (memo, promise) => memo.then(promise),
    Promise.resolve(),
  );

const ensurePathExists = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const path = electron.remote.require('path');

    return (targetPath) => {
      const relativePath = path.relative(userDataPath, targetPath);

      inSequence(
        getNestedPaths(relativePath)
          .map(pathSegment => mkDir(path.join(userDataPath, pathSegment))),
      ).then(() => targetPath);
    };
  }

  throw Error(`ensurePathExists not defined for this environment (${environment})`);
});

export {
  ensurePathExists,
  copyFile,
  readFile,
};
