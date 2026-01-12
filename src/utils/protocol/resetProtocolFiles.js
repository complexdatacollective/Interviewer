/**
 * Reset protocol files utility with secure API support.
 */
import environments from '../environments';
import inEnvironment from '../Environment';
import { userDataPath, removeDirectory } from '../filesystem';
import { pathSync } from '../electronAPI';

const resetProtocolFiles = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async () => {
      const basePath = await userDataPath();
      const protocolsPath = pathSync.join(basePath, 'protocols');
      return removeDirectory(protocolsPath);
    };
  }

  if (environment === environments.CORDOVA) {
    return () => {
      const protocolsPath = [userDataPath(), 'protocols'].join('/');
      return removeDirectory(protocolsPath);
    };
  }

  return () => Promise.reject(new Error('resetProtocolFiles() not available on platform'));
});

export default resetProtocolFiles;
