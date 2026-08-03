import { Buffer } from 'buffer';

import { CapacitorHttp } from '@capacitor/core';
import { v4 as uuid } from 'uuid';

import friendlyErrorMessage from '../../utils/friendlyErrorMessage';
import inEnvironment from '../Environment';
import environments from '../environments';
import { tempDataPath, writeFile } from '../filesystem';

const getURL = (uri) =>
  new Promise((resolve, reject) => {
    try {
      resolve(new URL(uri));
    } catch (error) {
      reject(error);
    }
  });

const getProtocolName = () => uuid(); // generate a filename

const urlError = friendlyErrorMessage(
  "The location you gave us doesn't seem to be a valid URL. Check the location, and try again.",
);
const networkError = friendlyErrorMessage(
  "We weren't able to fetch your protocol. Your device may not have an active network connection, or you may have mistyped the URL. Ensure you are connected to a network, double check your URL, and try again.",
);

/**
 * Download a protocol from a remote URL.
 *
 * @param {string} uri
 * @return {string} output filepath
 */
const downloadProtocol = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    return async (uri) => {
      const url = await getURL(uri).catch(urlError);

      if (!window.electronAPI?.protocol?.download) {
        throw new Error('electronAPI not available');
      }

      // Download in the main process to avoid renderer cross-origin (CORS) restrictions.
      return window.electronAPI.protocol.download(url.href).catch(networkError);
    };
  }

  if (environment === environments.CAPACITOR) {
    return async (uri) => {
      const url = await getURL(uri).catch(urlError);
      const destination = `${tempDataPath()}${getProtocolName()}`;

      // Download via native HTTP (CapacitorHttp), not a webview fetch: the
      // webview is subject to CORS and most protocol hosts don't send CORS
      // headers — the same reason the Electron branch downloads in its main
      // process. CapacitorHttp follows redirects (e.g. a GitHub release to its
      // CDN) and returns an `arraybuffer` response body as a base64 string.
      const response = await CapacitorHttp.get({
        url: url.href,
        responseType: 'arraybuffer',
      }).catch(networkError);

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to download protocol: HTTP ${response.status}`);
      }

      const data = Buffer.from(response.data, 'base64');
      await writeFile(destination, data);
      return destination;
    };
  }

  return () =>
    Promise.reject(new Error('downloadProtocol() not available on platform'));
});

export default downloadProtocol;
