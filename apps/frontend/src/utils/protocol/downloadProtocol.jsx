import { v4 as uuid } from 'uuid';
import environments from '../environments';
import inEnvironment from '../Environment';
import { writeFile } from '../filesystem';
import friendlyErrorMessage from '../friendlyErrorMessage';

const getURL = uri =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

const getProtocolName = () => uuid(); // generate a filename

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
  console.warn('downloadProtocol not implemented');
  if (environment === environments.ELECTRON) {
    // const path = require('path');
    // const tempPath = (electron.app || electron.remote.app).getPath('temp');
    // const destination = path.join(tempPath, getProtocolName());

    // return (uri, pairedServer = false) => {
    //   let promisedResponse;
    //   if (pairedServer) {
    //     promisedResponse = new ApiClient(pairedServer).downloadProtocol(uri);
    //   } else {
    //     promisedResponse = getURL(uri)
    //       .catch(urlError)
    //       .then(url => fetch({ method: 'GET', encoding: null, uri: url.href }));
    //   }

    //   return promisedResponse
    //     .catch(networkError)
    //     .then(data => writeFile(destination, data))
    //     .catch(fileError)
    //     .then(() => destination);
    // };
  }

  if (environment === environments.CORDOVA) {
    // const destination = `cdvfile://localhost/temporary/${getProtocolName()}`;
    // return (uri, pairedServer) => {
    //   let promisedResponse;
    //   if (pairedServer) {
    //     promisedResponse = new ApiClient(pairedServer)
    //       // .addTrustedCert() is not required, assuming we've just fetched the protocol list
    //       .downloadProtocol(uri, destination)
    //       .then(() => destination);
    //   } else {
    //     promisedResponse = getURL(uri)
    //       .then(url => url.href)
    //       .catch(urlError)
    //       .then(href => new Promise((resolve, reject) => {
    //         const fileTransfer = new FileTransfer();
    //         fileTransfer.download(
    //           href,
    //           destination,
    //           () => resolve(destination),
    //           error => reject(error),
    //         );
    //       }));
    //   }
    //   return promisedResponse
    //     .catch((error) => {
    //       const getErrorMessage = ({ code }) => {
    //         if (code === 3) return networkError;
    //         return urlError;
    //       };

    //       getErrorMessage(error)(error);
    //     });
    // };
  }

  return () => Promise.reject(new Error('downloadProtocol() not available on platform'));
});

export default downloadProtocol;
