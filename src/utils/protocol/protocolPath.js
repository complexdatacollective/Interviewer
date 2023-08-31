/* eslint-disable global-require */

import { isArray, isString } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath, appPath } from '../filesystem';

const isValidProtocolUID = protocolUID => (isString(protocolUID) && protocolUID.length > 0);

const ensureArray = (filePath = []) => {
  if (!isArray(filePath)) {
    return [filePath];
  }

  return filePath;
};

export const factoryProtocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolUID, filePath = '') => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');
      return path.join(appPath(), 'protocols', protocolUID, filePath);
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

const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolUID, filePath = []) => {
      if (!isValidProtocolUID(protocolUID)) throw Error('Protocol name is not valid');
      return path.join(userDataPath(), 'protocols', protocolUID, ...ensureArray(filePath));
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
