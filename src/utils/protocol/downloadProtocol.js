/* eslint-disable global-require */
import uuid from 'uuid/v4';
import environments from '../environments';
import inEnvironment from '../Environment';
import { writeFile } from '../filesystem';
import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import ApiClient from '../../utils/ApiClient';
import write_blob from 'capacitor-blob-writer';
import { Directory } from '@capacitor/filesystem';
import { CapacitorHttp } from '@capacitor/core';


const getURL = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

const urlError = friendlyErrorMessage("The location you gave us doesn't seem to be a valid URL. Check the location, and try again.");
const networkError = friendlyErrorMessage("We weren't able to fetch your protocol. Your device may not have an active network connection, or you may have mistyped the URL. Ensure you are connected to a network, double check your URL, and try again.");
const fileError = friendlyErrorMessage('The protocol could not be saved to your device. You might not have enough storage available. ');

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
    const destination = path.join(tempPath, uuid());

    return (uri, pairedServer = false) => {
      let promisedResponse;
      if (pairedServer) {
        promisedResponse = new ApiClient(pairedServer).downloadProtocol(uri);
      } else {
        promisedResponse = getURL(uri)
          .catch(urlError)
          .then(url => request({ method: 'GET', encoding: null, uri: url.href }));
      }

      return promisedResponse
        .catch(networkError)
        .then(data => writeFile(destination, data))
        .catch(fileError)
        .then(() => destination);
    };
  }

  if (environment === environments.CORDOVA) {

    // Generate a UUID to use as the temporary protocol name.
    const protocolName = uuid();
    return async (uri, pairedServer) => {
      try {
        if (pairedServer) {
          const client = new ApiClient(pairedServer);

          await client.downloadProtocol(uri, protocolName);

          return protocolName;
        }

        const { href } = await getURL(uri);

        const result = await CapacitorHttp.get({
          url: href,
          responseType: 'blob',
        });

        return write_blob({
          path: protocolName,
          directory: Directory.Cache,
          blob: result,
          recursive: true,
          on_fallback(errorDownload) {
            console.error('An error occured while downloading:');
            console.error(errorDownload);
          }
        });

      } catch (error) {
        const getErrorMessage = ({ code }) => {
          if (code === 3) return networkError;
          return urlError;
        };

        getErrorMessage(error)(error);
      }
    };
  }

  return () => Promise.reject(new Error('downloadProtocol() not available on platform'));
});

export default downloadProtocol;
