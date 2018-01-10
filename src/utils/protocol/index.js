/* eslint-disable import/no-mutable-exports,import/prefer-default-export */
import { isElectron } from '../../utils/Environment';

let getAsset = () => {};

if (isElectron()) {
  const electron = window.require('electron');
  const fs = electron.remote.require('fs');
  const path = electron.remote.require('path');

  const userDataPath = (electron.app || electron.remote.app).getPath('userData');

  getAsset = (assetPath) => {
    const fullPath = path.join(userDataPath, assetPath);
    const extension = path.extname(assetPath);

    return new Promise((resolve, reject) => {
      fs.readFile(fullPath, 'base64', (err, data) => {
        if (err) { reject(err); }
        resolve(data);
      });
    }).then(data => `data:image/${extension.split('.').pop()};base64,${data}`);
  };
}

export { getAsset };
