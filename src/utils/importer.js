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

  const getUserDataFilename = (filename) => {
    const basename = path.basename(filename);
    return path.join(userDataPath, basename);
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

  const extractZipFile = (zipObject) => {
    const destination = path.join(userDataPath, zipObject.name);

    console.log(destination, zipObject);

    return new Promise((resolve, reject) => {
      zipObject
        .nodeStream()
        .pipe(fs.createWriteStream(destination))
        .on('error', (err) => {
          reject(destination, err);
        })
        .on('finish', () => {
          resolve(destination);
        });
    });
  };

  const extractZipDir = (zipObject) => {
    const destination = path.join(userDataPath, zipObject.name);

    console.log(destination, zipObject);

    return new Promise((resolve, reject) => {
      fs.mkdir(destination, (err) => {
        if (err) { reject(err); }
        resolve(destination);
      });
    });
  };

  const extractZip = (protocol) => {
    console.log('extract', protocol);

    return readFile(protocol)
      .then(data => Zip.loadAsync(data))
      .then(zip =>
        Promise.all(
          Object.keys(zip.files)
            .map(filename => zip.files[filename])
            .map(zipObject => (
              zipObject.dir ? extractZipDir(zipObject) : extractZipFile(zipObject)
            )),
        ),
      )
      .then((files) => { console.log(files); });
  };

  importer = (source) => {
    console.log('import', source);
    const destination = getUserDataFilename(source);

    return copyFile(source, destination)
      .then(extractZip)
      .then(() => console.log(`delete zip ${destination}`));
  };
}

export default importer;
