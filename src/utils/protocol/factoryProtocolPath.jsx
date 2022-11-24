/* eslint-disable global-require */

import { isString } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { appPath } from '../filesystem';

const isValidProtocolName = protocolName => (isString(protocolName) && protocolName.length > 0);

const factoryProtocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolName, filePath = '') => {
      if (!isValidProtocolName(protocolName)) throw Error('Protocol name is not valid');
      return path.join(appPath(), 'protocols', protocolName, filePath);
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
