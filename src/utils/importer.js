/* eslint-disable import/no-mutable-exports */
import Zip from 'jszip';
import { isElectron } from '../utils/Environment';

// 1. copy zip to app dir
// 2. unzip
// 3. delete zip

let importer = null;

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');
  const fs = electron.remote.require('fs');

  const userDataPath = (electron.app || electron.remote.app).getPath('userData');

  const getProtocolPath = (protocolName) => {
    const basename = path.basename(protocolName);
    return path.join(userDataPath, 'protocols', basename);
  };

  const readFile = filename =>
    new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) { reject(err); }
        resolve(data);
      });
    });

  const copyFile = (source, destination) => {
    console.log('copy', source, destination);

    return new Promise((resolve, reject) => {
      const destinationStream = fs.createWriteStream(destination);
      const sourceStream = fs.createReadStream(source);

      destinationStream.on('close', (err) => {
        if (err) { reject(err); }
        resolve(destination);
      });

      sourceStream.pipe(destinationStream);
    });
  };

  const extractZipFile = (zipObject, destination) => {
    const extractPath = path.join(destination, zipObject.name);

    console.log(extractPath, zipObject);

    return new Promise((resolve, reject) => {
      zipObject
        .nodeStream()
        .pipe(fs.createWriteStream(extractPath))
        .on('error', (err) => {
          reject(extractPath, err);
        })
        .on('finish', () => {
          resolve(extractPath);
        });
    });
  };

  const mkDir = targetPath =>
    new Promise((resolve, reject) => {
      fs.mkdir(targetPath, (err) => {
        if (err) { reject(err); }
        console.log(targetPath);
        resolve(targetPath);
      });
    });

  const extractZipDir = (zipObject, destination) => {
    const extractPath = path.join(destination, zipObject.name);

    console.log(extractPath, zipObject);

    return mkDir(extractPath);
  };

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

  const extractZip = (source, destination) =>
    readFile(source)
      .then(data => Zip.loadAsync(data))
      .then(zip =>
        Promise.all(
          Object.keys(zip.files)
            .map(filename => zip.files[filename])
            .map(zipObject => (
              zipObject.dir ?
                extractZipDir(zipObject, destination) :
                extractZipFile(zipObject, destination)
            )),
        ),
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
    );
  };

  importer = (protocolFile) => {
    console.log('import', protocolFile);
    const destination = getProtocolPath(protocolFile);

    ensurePathExists(destination);

    return extractZip(protocolFile, destination)
      .then((files) => { console.log(files); });
  };
}

export default importer;
