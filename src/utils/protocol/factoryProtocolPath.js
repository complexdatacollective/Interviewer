/**
 * Factory protocol path utilities with secure API support.
 *
 * Note: In Electron, this function is now async because it depends on
 * IPC calls to get the app path.
 */
import { isString } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { appPath } from '../filesystem';
import { pathSync } from '../electronAPI';

const isValidProtocolName = (protocolName) => (isString(protocolName) && protocolName.length > 0);

const factoryProtocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    return async (protocolName, filePath = '') => {
      if (!isValidProtocolName(protocolName)) throw Error('Protocol name is not valid');
      const basePath = await appPath();
      return pathSync.join(basePath, 'protocols', protocolName, filePath);
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolName, filePath) => {
      if (!isValidProtocolName(protocolName)) throw Error('Protocol name is not valid');

      return [appPath(), 'www', 'protocols', protocolName].concat([filePath]).join('/');
    };
  }

  throw new Error('factoryProtocolPath() is not supported on this platform');
};

export default inEnvironment(factoryProtocolPath);
