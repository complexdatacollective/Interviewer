/* eslint-disable global-require */

import Zip from 'jszip';
import environments from './environments';
import inEnvironment from './Environment';
import { ensurePathExists, readFile } from './filesystem';
import { protocolPath } from './protocol';

const extractZipDir = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (zipObject, destination) => {
      const extractPath = path.join(destination, zipObject.name);

      return ensurePathExists(extractPath);
    };
  }

  return () => Promise.reject('Environment not recognised');
});

const extractZipFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');
    const fs = require('fs');

    return (zipObject, destination) => {
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
  }

  return () => Promise.reject('Environment not recognised');
});

const extractZip = inEnvironment((environment) => {
  if (environment !== environments.WEB) {
    return (source, destination) =>
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
  }

  return Promise.reject();
});

const importer = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolFile) => {
      const basename = path.basename(protocolFile);
      const destination = protocolPath(basename);

      ensurePathExists(destination);

      return extractZip(protocolFile, destination);
    };
  }

  return () => { console.log('Import feature not available for web'); return true; };
});

export default importer;
