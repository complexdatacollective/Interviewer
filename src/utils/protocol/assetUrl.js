/* eslint-disable import/no-mutable-exports */
import { isElectron } from '../../utils/Environment';

let assetUrl = null;

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');

  assetUrl = (protocolName, assetPath) => {
    const basename = path.basename(protocolName);
    return `asset://${path.join(basename, 'assets', assetPath)}`;
  };
}

export default assetUrl;
