/* eslint-disable global-require */

import environments from '../environments';
import inEnvironment from '../Environment';

const isRequired = (param) => { throw new Error(`${param} is required`); };

const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const electron = require('electron');
    const path = require('path');

    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    return (protocolName = isRequired('protocolName'), filePath = '') =>
      path.join(userDataPath, 'protocols', protocolName, filePath);
  }

  return () => {};
};

export { protocolPath };

export default inEnvironment(protocolPath);
