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

  return () => Promise.reject('Environment not recognised');
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

  return () => Promise.reject('Environment not recognised');
});

const extractZip = inEnvironment((environment) => {
  if (environment !== environments.WEB) {
    return (source, destination) =>
      readFile(source)
        .then(data => Zip.loadAsync(data))
        .then(zip =>
          inSequence(
            Object.values(zip.files),
            // Object.keys(zip.files)
            //   .map(filename => zip.files[filename]), // get zipObjects for each file
            zipObject => (
              zipObject.dir ?
                extractZipDirectory(zipObject, destination) :
                extractZipFile(zipObject, destination)
            ),
          ),
        );
  }

  return Promise.reject();
});

const importer = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    console.log('electron');
    const path = require('path');

    return () => { // return (protocolFile) => { TODO: Proper spec
      const protocolFile = `${window.__dirname}/demo.canvas`; // eslint-disable-line
      const basename = path.basename(protocolFile);
      const destination = protocolPath(basename);

      return ensurePathExists(destination)
        .then(extractZip(protocolFile, destination));
    };
  }

  if (environment === environments.CORDOVA) {
    return () => { // return (protocolFile) => { TODO: Proper spec
      const protocolFile = `${cordova.file.applicationDirectory}www/demo.canvas`;
      const destination = protocolPath('demo.canvas');

      return removeDirectory(destination)
        .then(() => ensurePathExists(destination))
        .then(() => extractZip(protocolFile, destination))
        .catch(e => console.log({ e }, 'an error happened in importer'));
    };
  }

  return () => { console.log('Import feature not available for web'); return true; };
});

export default importer;
