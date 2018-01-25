/* eslint-disable global-require */

import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath } from '../filesystem';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const path = require('path');

    return (protocolName = isRequired('protocolName'), filePath = '') =>
      path.join(userDataPath(), 'protocols', protocolName, filePath);
  }

  if (environment === environments.CORDOVA) {
    return (protocolName = isRequired('protocolName'), filePath = '') =>
      [userDataPath(), protocolName, protocolName, filePath].join('/');  // TODO: WORK AROUND MALFORMED PATHS
  }

  throw new Error('protocolPath not specified on this platform');
};

window.protocolPath = inEnvironment(protocolPath);

export default inEnvironment(protocolPath);
