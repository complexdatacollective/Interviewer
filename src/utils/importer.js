import Zip from 'jszip';
import inEnvironment, { environments } from './Environment';
import { ensurePathExists, readFile } from './filesystem';
import { protocolPath } from './protocol';

const extractZipDir = inEnvironment(
  (environment) => {
    switch (environment) {
      case environments.ELECTRON: {
        const path = window.require('path');

        return (zipObject, destination) => {
          const extractPath = path.join(destination, zipObject.name);

          return ensurePathExists(extractPath);
        };
      }
      default:
        return () => Promise.reject('Environment not recognised');
    }
  },
);

const extractZipFile = inEnvironment(
  (environment) => {
    switch (environment) {
      case environments.ELECTRON: {
        const path = window.require('path');
        const fs = window.require('fs');

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
      default:
        return () => Promise.reject('Environment not recognised');
    }
  },
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

const importer = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = window.require('path');

    return (protocolFile) => {
      const basename = path.basename(protocolFile);
      const destination = protocolPath(basename);

      ensurePathExists(destination);

      return extractZip(protocolFile, destination);
    };
  }

  return null;
};

export { importer };

export default inEnvironment(importer);
