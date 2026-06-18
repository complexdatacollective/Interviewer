/**
 * Extract protocol utility with secure API support.
 */
import Zip from 'jszip';
import { v4 as uuid } from 'uuid';

import { pathSync } from '../electronAPI';
import inEnvironment from '../Environment';
import environments from '../environments';
import {
  ensurePathExists,
  inSequence,
  readFile,
  writeFile,
} from '../filesystem';
import friendlyErrorMessage from '../friendlyErrorMessage';
import protocolPath from './protocolPath';
import { checkZipPaths } from './zipValidation';

const isRequired = (param) => {
  throw new Error(`${param} is required`);
};

const openError = friendlyErrorMessage(
  "We couldn't open that Network Canvas protocol. Check the format, and try again.",
);
const loadError = friendlyErrorMessage(
  "We couldn't load that Network Canvas protocol. Try importing again.",
);

const prepareDestination = async (destination) => {
  // The destination is always a freshly generated UUID directory, so there is
  // nothing to remove first — and removing a non-existent directory logs a
  // native filesystem error on Capacitor.
  await ensurePathExists(destination);
};

const generateProtocolUID = () => uuid();

const extractZipDirectory = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return (zipObject, destination) => {
      const extractPath = pathSync.join(destination, zipObject.name);
      return ensurePathExists(extractPath);
    };
  }

  if (environment === environments.CAPACITOR) {
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;
      return ensurePathExists(extractPath);
    };
  }

  return () =>
    Promise.reject(new Error('extractZipDir() not available on platform'));
});

const extractZipFile = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    // JSZip's nodeStream() does not work in the Vite/Electron renderer; use the
    // browser-native async('uint8array') and write the buffer via secure IPC.
    return (zipObject, destination) => {
      const extractPath = pathSync.join(destination, zipObject.name);
      return zipObject
        .async('uint8array')
        .then((data) => writeFile(extractPath, data));
    };
  }

  if (environment === environments.CAPACITOR) {
    // Mirror the Electron branch: JSZip's streaming APIs stall in the
    // Vite-built webview, so read the whole entry and write the buffer.
    return (zipObject, destination) => {
      const extractPath = `${destination}${zipObject.name}`;
      return zipObject
        .async('uint8array')
        .then((data) => writeFile(extractPath, data));
    };
  }

  return () =>
    Promise.reject(new Error('extractZipFile() not available on platform'));
});

const extractZip = inEnvironment((environment) => {
  if (
    environment === environments.CAPACITOR ||
    environment === environments.ELECTRON
  ) {
    return (zip, destination) =>
      prepareDestination(destination)
        .then(() => checkZipPaths(Object.keys(zip.files)))
        .then(() =>
          inSequence(Object.values(zip.files), (zipObject) =>
            zipObject.dir
              ? extractZipDirectory(zipObject, destination)
              : extractZipFile(zipObject, destination),
          ),
        );
  }

  return () =>
    Promise.reject(new Error('extractZip() not available on platform'));
});

const loadZip = inEnvironment((environment) => {
  if (
    environment === environments.CAPACITOR ||
    environment === environments.ELECTRON
  ) {
    return (source) =>
      readFile(source)
        .then((data) => Zip.loadAsync(data))
        .catch(loadError);
  }

  throw new Error(`loadZip() not available on platform ${environment}`);
});

const importZip = inEnvironment((environment) => {
  if (
    environment === environments.CAPACITOR ||
    environment === environments.ELECTRON
  ) {
    return (protocolFile, protocolName, destination) =>
      loadZip(protocolFile)
        .then((zip) => extractZip(zip, destination))
        .catch((_error) => {
          return openError;
        })
        .then(() => protocolName);
  }

  return () => Promise.reject(new Error('loadZip() not available on platform'));
});

const extractProtocol = inEnvironment((environment) => {
  if (
    environment === environments.ELECTRON ||
    environment === environments.CAPACITOR
  ) {
    return async (protocolFile = isRequired('protocolFile')) => {
      const protocolName = generateProtocolUID();
      const destination = await protocolPath(protocolName);
      return importZip(protocolFile, protocolName, destination);
    };
  }

  return () =>
    Promise.reject(new Error('extractProtocol() not available on platform'));
});

export default extractProtocol;
