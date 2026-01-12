/**
 * Protocol path utilities with secure API support.
 *
 * Note: In Electron, these functions are now async because they depend on
 * IPC calls to get user data and app paths.
 */
import { isArray, isString } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath, appPath } from '../filesystem';
import { pathSync } from '../electronAPI';

const isValidProtocolUID = (protocolUID) => (isString(protocolUID) && protocolUID.length > 0);

const ensureArray = (filePath = []) => {
  if (!isArray(filePath)) {
    return [filePath];
  }

  return filePath;
};

/**
 * Get path to factory protocol (bundled with the app).
 * Returns a Promise in Electron.
 */
export const factoryProtocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    return async (protocolUID, filePath = '') => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');
      const basePath = await appPath();
      return pathSync.join(basePath, 'protocols', protocolUID, filePath);
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolUID, filePath) => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');

      return [appPath(), 'www', 'protocols', protocolUID].concat([filePath]).join('/');
    };
  }

  throw new Error('factoryProtocolPath() is not supported on this platform');
};

/**
 * Get path to user protocol (installed by user).
 * Returns a Promise in Electron.
 */
const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    return async (protocolUID, filePath = []) => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');
      const basePath = await userDataPath();
      return pathSync.join(basePath, 'protocols', protocolUID, ...ensureArray(filePath));
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolUID, filePath) => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');

      if (!filePath) {
        // Cordova expects a trailing slash:
        return `${userDataPath()}protocols/${protocolUID}/`;
      }

      return `${userDataPath()}protocols/${protocolUID}/${filePath}`;
    };
  }

  throw new Error('protocolPath() not specified on this platform');
};

export default inEnvironment(protocolPath);
