/**
 * Protocol path utilities with secure API support.
 *
 * Note: In Electron, these functions are now async because they depend on
 * IPC calls to get user data and app paths.
 */
import { isArray, isString } from 'lodash';

import { pathSync } from '../electronAPI';
import inEnvironment from '../Environment';
import environments from '../environments';
import { userDataPath } from '../filesystem';

const isValidProtocolUID = (protocolUID) =>
  isString(protocolUID) && protocolUID.length > 0;

const ensureArray = (filePath = []) => {
  if (!isArray(filePath)) {
    return [filePath];
  }

  return filePath;
};

/**
 * Get path to user protocol (installed by user).
 * Returns a Promise in Electron.
 */
const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    return async (protocolUID, filePath = []) => {
      if (!isValidProtocolUID(protocolUID))
        throw Error('Protocol name is not valid');
      const basePath = await userDataPath();
      return pathSync.join(
        basePath,
        'protocols',
        protocolUID,
        ...ensureArray(filePath),
      );
    };
  }

  if (environment === environments.CAPACITOR) {
    // Async to match the Electron contract: callers (e.g. parseProtocol) do
    // `protocolPath(...).then(...)`, and others `await` it.
    return async (protocolUID, filePath) => {
      if (!isValidProtocolUID(protocolUID))
        throw Error('Protocol name is not valid');
      if (!filePath) return `protocols/${protocolUID}/`;
      return `protocols/${protocolUID}/${filePath}`;
    };
  }

  throw new Error('protocolPath() not specified on this platform');
};

export default inEnvironment(protocolPath);
