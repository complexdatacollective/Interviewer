import inEnvironment, { environments } from '../Environment';

const protocolPath = (environment) => {
  if (environment === environments.ELECTRON) {
    const electron = window.require('electron');
    const path = electron.remote.require('path');

    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    return (protocolName, filePath = '') =>
      path.join(userDataPath, 'protocols', protocolName, filePath);
  }

  return () => {};
};

export { protocolPath };

export default inEnvironment(protocolPath);
