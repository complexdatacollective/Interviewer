/* eslint-disable import/no-mutable-exports */
import { isElectron } from '../../utils/Environment';

let filesystem = {};

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');
  const fs = electron.remote.require('fs');

  const userDataPath = (electron.app || electron.remote.app).getPath('userData');

  const readFile = (filename, options = null) =>
    new Promise((resolve, reject) => {
      fs.readFile(filename, options, (err, data) => {
        if (err) { reject(err); }
        console.log('readFile', filename, data);
        resolve(data);
      });
    });

  const copyFile = (source, destination) =>
    new Promise((resolve, reject) => {
      const destinationStream = fs.createWriteStream(destination);
      const sourceStream = fs.createReadStream(source);

      destinationStream.on('close', (err) => {
        if (err) { reject(err); }
        resolve(destination);
      });

      sourceStream.pipe(destinationStream);
    });

  const mkDir = targetPath =>
    new Promise((resolve, reject) => {
      fs.mkdir(targetPath, (err) => {
        if (err) { reject(err); }
        resolve(targetPath);
      });
    });

  const getNestedPaths = targetPath =>
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

  const inSequence = promises =>
    promises.reduce(
      (memo, promise) => memo.then(promise),
      Promise.resolve(),
    );

  const ensurePathExists = (targetPath) => {
    const relativePath = path.relative(userDataPath, targetPath);

    inSequence(
      getNestedPaths(relativePath)
        .map(pathSegment => mkDir(path.join(userDataPath, pathSegment))),
    ).then(() => targetPath);
  };

  filesystem = {
    ensurePathExists,
    copyFile,
    readFile,
  };
}

export default filesystem;
