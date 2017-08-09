/* eslint-disable */
import axios from 'axios';
import Promise from 'bluebird';
import { isCordova, isElectron } from './Environment';

const getProtocolFile = (path) => {
  if (isCordova()) {
    return Promise.reject('Local protocol file not yet supported in Cordova');
  } else if (isElectron()) {
    const fs = window.require('fs');

    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) reject(err);
        resolve({ data });
      });
    });
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
