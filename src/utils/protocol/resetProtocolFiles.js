/**
 * Reset protocol files utility with secure API support.
 */

import { pathSync } from '../electronAPI';
import inEnvironment from '../Environment';
import environments from '../environments';
import { removeDirectory, userDataPath } from '../filesystem';

const resetProtocolFiles = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async () => {
      const basePath = await userDataPath();
      const protocolsPath = pathSync.join(basePath, 'protocols');
      return removeDirectory(protocolsPath);
    };
  }

  if (environment === environments.CAPACITOR) {
    return () => {
      const protocolsPath = [userDataPath(), 'protocols'].join('/');
      return removeDirectory(protocolsPath);
    };
  }

  return () =>
    Promise.reject(new Error('resetProtocolFiles() not available on platform'));
});

export default resetProtocolFiles;
