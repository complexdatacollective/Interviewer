/* eslint-disable global-require */
// import Zip from 'jszip';
import { v4 as uuid } from 'uuid';
import environments from '../environments';
import inEnvironment from '../Environment';
import friendlyErrorMessage from '../friendlyErrorMessage';
import {
  removeDirectory,
  ensurePathExists,
  readFile,
  writeStream,
  inSequence,
} from '../filesystem';
import protocolPath from './protocolPath';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const openError = friendlyErrorMessage("We couldn't open that Network Canvas protocol. Check the format, and try again.");
const loadError = friendlyErrorMessage("We couldn't load that Network Canvas protocol. Try importing again.");

const prepareDestination = destination =>
  removeDirectory(destination)
    .then(() => ensurePathExists(destination));

const generateProtocolUID = () => uuid(); // generate a filename

const extractZipDirectory = inEnvironment((environment) => {
  // if (environment === environments.ELECTRON) {
  //   const path = require('path');

  //   return (zipObject, destination) => {
  //     const extractPath = path.join(destination, zipObject.name);

  //     return ensurePathExists(extractPath);
  //   };
  // }

  // if (environment === environments.CORDOVA) {
  //   return (zipObject, destination) => {
  //     const extractPath = `${destination}${zipObject.name}`;

  //     return ensurePathExists(extractPath);
  //   };
  // }

  return () => Promise.reject(new Error('extractZipDir() not available on platform'));
});

const extractZipFile = inEnvironment((environment) => {
  // if (environment === environments.ELECTRON) {
  //   const path = require('path');

  //   return (zipObject, destination) => {
  //     const extractPath = path.join(destination, zipObject.name);
  //     return writeStream(extractPath, zipObject.nodeStream());
  //   };
  // }

  // if (environment === environments.CORDOVA) {
  //   return (zipObject, destination) => {
  //     const extractPath = `${destination}${zipObject.name}`;
  //     return writeStream(extractPath, zipObject.internalStream('uint8array'));
  //   };
  // }

  return () => Promise.reject(new Error('extractZipFile() not available on platform'));
});

const checkZipPaths = (zip) => {
  console.warn('Checking zip paths not implemented');
  return Promise.resolve(zip);
};

const extractZip = inEnvironment((environment) => {
  // if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
  //   return (zip, destination) =>
  //     prepareDestination(destination)
  //       .then(() => checkZipPaths(Object.keys(zip.files)))
  //       .then(() =>
  //         inSequence(
  //           Object.values(zip.files),
  //           zipObject => (
  //             zipObject.dir ?
  //               extractZipDirectory(zipObject, destination) :
  //               extractZipFile(zipObject, destination)
  //           ),
  //         ),
  //       );
  // }

  return () => Promise.reject(new Error('extractZip() not available on platform'));
});

const loadZip = inEnvironment((environment) => {
  // if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
  //   return source =>
  //     readFile(source)
  //       .then(data => Zip.loadAsync(data))
  //       .catch(loadError);
  // }

  throw new Error(`loadZip() not available on platform ${environment}`);
});

const importZip = inEnvironment((environment) => {
  // if (environment === environments.CORDOVA || environment === environments.ELECTRON) {
  //   return (protocolFile, protocolName, destination) =>
  //     loadZip(protocolFile)
  //       .then(zip => extractZip(zip, destination))
  //       .catch(openError)
  //       .then(() => protocolName);
  // }

  return () => Promise.reject(new Error('loadZip() not available on platform'));
});

const extractProtocol = inEnvironment((environment) => {
  // if (environment === environments.ELECTRON || environment === environments.CORDOVA) {
  //   return (protocolFile = isRequired('protocolFile')) => {
  //     const protocolName = generateProtocolUID();
  //     const destination = protocolPath(protocolName);
  //     return importZip(protocolFile, protocolName, destination);
  //   };
  // }

  return () => Promise.reject(new Error('extractProtocol() not available on platform'));
});

export default extractProtocol;

export {
  checkZipPaths,
};
