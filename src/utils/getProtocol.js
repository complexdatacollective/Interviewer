/* eslint-disable */
import axios from 'axios';
import Promise from 'bluebird';
import { filesystem } from '../utils/importer';
import { isCordova, isElectron } from './Environment';

const getProtocolFile = (protocolName) => {
  if (isCordova()) {
    return Promise.reject('Local protocol file not yet supported in Cordova');
  } else if (isElectron()) {
    const electron = require('electron');
    const path = electron.remote.require('path');
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    const getProtocolPath = (protocolName) => {
      const basename = path.basename(protocolName);
      return path.join(userDataPath, 'protocols', basename);
    };

    console.log('getProtocolFile', path.join(getProtocolPath(protocolName), 'protocol.json'));

    return filesystem.readFile(path.join(getProtocolPath(protocolName), 'protocol.json'), 'utf8')
      .then(data => JSON.parse(data));
  }

  return Promise.reject('Environment not recognised');
};

const getProtocolWeb = url => axios({
  url,
  contentType: 'application/javascript',
});

const isUrl = (source) => source.match(/https?:\/\//);

const getProtocol = (source) => {
  if (!isUrl(source)) {
    return getProtocolFile(source);
  }
  return getProtocolWeb(source);
};

export default getProtocol;
