const path = require('path');
const electron = require('electron')

const userDataPath = (electron.app || electron.remote.app).getPath('userData');

const registerAssetsProtocol = () =>
  electron.protocol.registerFileProtocol('asset', (request, callback) => {
    const file = request.url.substr(8);
    const filePath = path.normalize(path.join(userDataPath, 'protocols', file));

    callback({ path: path.normalize(filePath) });
  }, (error) => {
    if (error) {
      console.error('Failed to register protocol');
    }
  });

exports.registerAssetsProtocol = registerAssetsProtocol;
