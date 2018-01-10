/* eslint-disable import/no-mutable-exports */
import Zip from 'jszip';
import { isElectron } from '../../utils/Environment';
import filesystem from './filesystem';

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

  const extractZipFile = (zipObject, destination) => {
    const extractPath = path.join(destination, zipObject.name);

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

  const extractZipDir = (zipObject, destination) => {
    const extractPath = path.join(destination, zipObject.name);

    return filesystem.ensurePathExists(extractPath);
  };

  const extractZip = (source, destination) =>
    filesystem.readFile(source)
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

  importer = (protocolFile) => {
    const destination = getProtocolPath(protocolFile);

    filesystem.ensurePathExists(destination);

    return extractZip(protocolFile, destination)
      .then((files) => { console.log(files); });
  };
}

export default importer;
