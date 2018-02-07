/* eslint-disable global-require */
/* global cordova */

import Zip from 'jszip';
import environments from '../environments';
import inEnvironment from '../Environment';
import { removeDirectory, ensurePathExists, readFile, writeStream, writeFile, inSequence } from '../filesystem';
import { protocolPath } from './';

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
    return (source, destination) =>
      readFile(source)
        .then(data => Zip.loadAsync(data))
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
  }

  throw new Error(`extractZip() not available on platform ${environment}`);
});

const isRequired = (param) => { throw new Error(`${param} is required`); };

const importProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolFile = isRequired('protocolFile')) => {
      const protocolName = path.basename(protocolFile);
      const destination = protocolPath(protocolName);

      return removeDirectory(destination)
        .then(() => ensurePathExists(destination))
        .then(() => extractZip(protocolFile, destination))
        .then(() => protocolName);
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolFileUri = isRequired('protocolFileUri')) => {
      const protocolName = new URL(protocolFileUri).pathname.split('/').pop();
      const destination = protocolPath(protocolName);

      return removeDirectory(destination)
        .then(() => ensurePathExists(destination))
        .then(() => extractZip(protocolFileUri, destination))
        .then(() => protocolName);
    };
  }

  throw new Error(`importProtocol() not available on platform ${environment}`);
});

export default importProtocol;
