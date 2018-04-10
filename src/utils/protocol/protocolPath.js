/* eslint-disable global-require */

import { isString } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath } from '../filesystem';

const isValidProtocolName = protocolName => (isString(protocolName) && protocolName.length > 0);

const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = window.require('path');

    return (protocolName, filePath = '') => {
      if (!isValidProtocolName(protocolName)) throw Error('Protocol name is not valid');
      return path.join(userDataPath(), 'protocols', protocolName, filePath);
    };
  }

  if (environment === environments.CORDOVA) {
    return (protocolName, filePath) => {
      if (!isValidProtocolName(protocolName)) throw Error('Protocol name is not valid');

      return [userDataPath(), 'protocols', protocolName].concat([filePath]).join('/');
    };
  }

  throw new Error('protocolPath() not specified on this platform');
};

export default inEnvironment(protocolPath);
