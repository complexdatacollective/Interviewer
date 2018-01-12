/* eslint-disable import/no-mutable-exports */
import { isElectron } from '../Environment';

let protocolPath = null;

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');

  const userDataPath = (electron.app || electron.remote.app).getPath('userData');

  protocolPath = (protocolName, filePath = '') => {
    return path.join(userDataPath, 'protocols', protocolName, filePath);
  };
}

export default protocolPath;
