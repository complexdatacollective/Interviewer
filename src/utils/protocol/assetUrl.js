/* eslint-disable import/no-mutable-exports */
import { isElectron } from '../Environment';

let assetUrl = null;

if (isElectron()) {
  const electron = window.require('electron');
  const path = electron.remote.require('path');

  assetUrl = (protocolName, assetPath) => `asset://${path.join(protocolName, 'assets', assetPath)}`;
}

export default assetUrl;
