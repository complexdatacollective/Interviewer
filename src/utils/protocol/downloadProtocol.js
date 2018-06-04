/* eslint-disable global-require */
/* global window, FileTransfer */
import { isEmpty } from 'lodash';
import environments from '../environments';
import inEnvironment from '../Environment';
import { writeFile } from '../filesystem';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';

const getURL = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

const getProtocolNameFromUrl = (url) => {
  const protocolName = url.pathname.split('/').pop();
  if (isEmpty(protocolName)) { throw Error('Protocol name cannot be empty'); }
  return decodeURIComponent(protocolName);
};

const urlError = friendlyErrorMessage("The location you gave us doesn't seem to be valid. Check the location, and try again.");
const networkError = friendlyErrorMessage("We weren't able to fetch your protocol at this time. Your device may not have an active network connection - connect to a network, and try again.");
const fileError = friendlyErrorMessage('The protocol could not be saved to your device.');

const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request-promise-native');
    const path = require('path');
    const electron = require('electron');

    return (uri) => {
      const tempPath = (electron.app || electron.remote.app).getPath('temp');

      return getURL(uri)
        .then((url) => {
          const destination = path.join(tempPath, getProtocolNameFromUrl(url));

          return request({ method: 'GET', encoding: null, uri: url.href })
            .catch(networkError)
            .then(data => writeFile(destination, data))
            .catch(fileError)
            .then(() => destination);
        })
        .catch(urlError);
    };
  }

  if (environment === environments.CORDOVA) {
    return uri =>
      getURL(uri)
        .then(url => [
          url.href,
          `cdvfile://localhost/temporary/${getProtocolNameFromUrl(url)}`,
        ])
        .catch(urlError)
        .then(([url, destination]) =>
          new Promise((resolve, reject) => {
            const fileTransfer = new FileTransfer();
            fileTransfer.download(
              url,
              destination,
              () => resolve(destination),
              error => reject(error),
            );
          }),
        )
        .catch((error) => {
          const getErrorMessage = ({ code }) => {
            if (code === 3) return networkError;
            return urlError;
          };

          getErrorMessage(error)(error);
        });
  }

  return () => Promise.reject(new Error('downloadProtocol() not available on platform'));
});

export default downloadProtocol;
