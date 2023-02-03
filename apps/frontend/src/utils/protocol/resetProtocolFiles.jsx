/* eslint-disable global-require */

import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath, removeDirectory } from '../filesystem';

const resetProtocolFiles = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    // const path = require('path');

    // return () => {
    //   const protocolsPath = path.join(userDataPath(), 'protocols');
    //   return removeDirectory(protocolsPath);
    // };
  }

  if (environment === environments.CORDOVA) {
    // return () => {
    //   const protocolsPath = [userDataPath(), 'protocols'].join('/');
    //   return removeDirectory(protocolsPath);
    // };
  }

  return () => Promise.reject(new Error('resetProtocolFiles() not available on platform'));
});

export default resetProtocolFiles;
