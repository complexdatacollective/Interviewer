/* eslint-disable global-require */
/* global FileTransfer */
import uuid from 'uuid/v4';
import environments from '../environments';
import inEnvironment from '../Environment';
import { writeFile } from '../filesystem';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import ApiClient from '../../utils/ApiClient';

const getURL = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

// Browser http request to support downloads from NC Server
// Matches interface from request-promise-native, which is needed
// to support URL imports from servers without lenient CORS support.
const xhrRequest = ({ method, uri }) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, uri);
  xhr.responseType = 'arraybuffer';
  const promise = new Promise((resolve, reject) => {
    xhr.addEventListener('load', function onLoad() {
      resolve(new Uint8Array(this.response));
    });
    xhr.addEventListener('error', (err) => {
      reject(err);
    });
  });
  xhr.send();
  return promise;
};

const getProtocolName = () => uuid(); // generate a filename

const urlError = friendlyErrorMessage("The location you gave us doesn't seem to be valid. Check the location, and try again.");
const networkError = friendlyErrorMessage("We weren't able to fetch your protocol at this time. Your device may not have an active network connection - connect to a network, and try again.");
const fileError = friendlyErrorMessage('The protocol could not be saved to your device.');

/**
 * Download a protocol from a remote server.
 *
 * If the URL points to an instance of a Network Canvas Server, then the caller must ensure
 * that the SSL certificate has been trusted. See {@link ApiClient#addTrustedCert}.
 *
 * @param {string} uri
 * @return {string} output filepath
 */
const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const request = require('request-promise-native');
    const path = require('path');
    const electron = require('electron');
    const tempPath = (electron.app || electron.remote.app).getPath('temp');

    return (uri, fromNCServer) =>
      getURL(uri)
        .then((url) => {
          const destination = path.join(tempPath, getProtocolName());
          const req = fromNCServer ? xhrRequest : request;
          return req({ method: 'GET', encoding: null, uri: url.href })
            .catch(networkError)
            .then(data => writeFile(destination, data))
            .catch(fileError)
            .then(() => destination);
        })
        .catch(urlError);
  }

  if (environment === environments.CORDOVA) {
    return (uri, pairedServer) =>
      getURL(uri)
        .then(url => [
          url.href,
          `cdvfile://localhost/temporary/${getProtocolName()}`,
        ])
        .catch(urlError)
        .then(([url, destination]) => {
          if (pairedServer) {
            return new ApiClient(pairedServer)
              // .addTrustedCert() is not required, assuming we've just fetched the protocol list
              .downloadProtocol(url, destination)
              .then(() => destination);
          }
          return new Promise((resolve, reject) => {
            const fileTransfer = new FileTransfer();
            fileTransfer.download(
              url,
              destination,
              () => resolve(destination),
              error => reject(error),
            );
          });
        })
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
