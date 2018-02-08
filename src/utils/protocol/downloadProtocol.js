/* eslint-disable global-require */
/* global window, FileTransfer */

import environments from '../environments';
import inEnvironment from '../Environment';
import { writeStream } from '../filesystem';

const getProtocolNameFromUri = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri).pathname.split('/').pop());
    } catch (e) {
      reject(e);
    }
  });

const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request');
    const path = require('path');
    const electron = require('electron');

    return (uri) => {
      const tempPath = (electron.app || electron.remote.app).getPath('temp');

      return getProtocolNameFromUri(uri)
        .then(protocolName => path.join(tempPath, protocolName))
        .then(destination => writeStream(destination, request(uri)));
    };
  }

  if (environment === environments.CORDOVA) {
    return uri =>
      getProtocolNameFromUri(uri)
        .then(protocolName => `cdvfile://localhost/temporary/${protocolName}`)
        .then(destination =>
          new Promise((resolve, reject) => {
            const fileTransfer = new FileTransfer();
            fileTransfer.download(
              encodeURI(uri),
              destination,
              () => resolve(destination),
              error => reject(`Error code: ${error.code}. (${error.source})`),
            );
          }),
        );
  }

  throw new Error(`downloadProtocol() not available on platform ${environment}`);
});

export default downloadProtocol;
