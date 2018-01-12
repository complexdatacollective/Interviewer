/* eslint-disable import/no-mutable-exports */
import Zip from 'jszip';
import { isElectron } from './Environment';
import filesystem from './filesystem';
import { protocolPath } from './protocol';

let importer = null;

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');
  const fs = electron.remote.require('fs');

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
    const basename = path.basename(protocolFile);
    const destination = protocolPath(basename);

    filesystem.ensurePathExists(destination);

    return extractZip(protocolFile, destination);
  };
}

export default importer;
