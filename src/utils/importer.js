/* eslint-disable */
/* eslint-disable global-require */
/* global cordova */

import Zip from 'jszip';
import environments from './environments';
import inEnvironment from './Environment';
import { removeDirectory, ensurePathExists, readFile, writeStream, writeFile, inSequence } from './filesystem';
import { protocolPath } from './protocol';

const extractZipDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (zipObject, destination) => {
      const extractPath = path.join(destination, zipObject.name);

      return ensurePathExists(extractPath);
    };
  }

  if (environment === environments.CORDOVA) {
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;

      return ensurePathExists(extractPath);
    };
  }

  throw new Error(`extractZipDir() not available on platform ${environment}`);
});

const extractZipFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (zipObject, destination) => {
      const extractPath = path.join(destination, zipObject.name);

      return writeStream(extractPath, zipObject.nodeStream());
    };
  }

  if (environment === environments.CORDOVA) {
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;

      return zipObject.async('blob')
        .then(data => writeFile(extractPath, data));
    };
  }

  throw new Error(`extractZipFile() not available on platform ${environment}`);
});

const extractZip = inEnvironment((environment) => {
  if (environment !== environments.WEB) {
    return (source, destination) => {
      console.log('extract zip');
      return readFile(source)
        .then(data => Zip.loadAsync(data))
        .then((zip) => { console.log(zip); return zip; })
        .then(zip =>
          inSequence(
            Object.values(zip.files),
            zipObject => (
              zipObject.dir ?
                extractZipDirectory(zipObject, destination) :
                extractZipFile(zipObject, destination)
            ),
          ),
        );
    };
  }

  throw new Error(`extractZip() not available on platform ${environment}`);
});

const importer = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    console.log('electron');
    const path = require('path');

    // TODO: remove fallback file
    return (protocolFile = `${window.__dirname}/demo.canvas`) => { // eslint-disable-line
      const basename = path.basename(protocolFile);
      const destination = protocolPath(basename);

      return removeDirectory(destination)
        .then(() => ensurePathExists(destination))
        .then(() => extractZip(protocolFile, destination));
    };
  }

  if (environment === environments.CORDOVA) {
    // TODO: remove fallback file
    return (protocolFileUri = `${cordova.file.applicationDirectory}www/demo.canvas`) => {
      const protocolName = new URL(protocolFileUri).pathname.split('/').pop();
      const destination = protocolPath(protocolName);

      return removeDirectory(destination)
        .then(() => ensurePathExists(destination))
        .then(() => extractZip(protocolFileUri, destination));
    };
  }

  throw new Error(`importer() not available on platform ${environment}`);
});

window.importer = importer;

export default importer;
