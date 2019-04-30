/* globals cordova */
import axios from 'axios';
import { isString } from 'lodash';
import { decrypt, deriveSecretKeyBytes, encrypt, fromHex, toHex } from 'secure-comms-api/cipher';

import { isCordova, isElectron } from '../utils/Environment';

const ApiErrorStatus = 'error';

// Error message to display when there's no usable message from server
const UnexpectedResponseMessage = 'Unexpected Response';
const NoResponseMessage = 'Server could not be reached';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

// A throwable 'friendly' error containing message from server
const apiError = (respJson) => {
  const error = new Error('API error');

  // Provide a friendly message, if available.
  if (respJson.message) {
    error.friendlyMessage = respJson.message;
    error.code = respJson.code;
    error.stack = null;
  }
  throw error;
};

const handleError = (err) => {
  if (axios.isCancel(err)) {
    return false;
  }
  // Handle errors from the response
  if (err.response) {
    if (err.response.data.status === ApiErrorStatus) {
      return apiError({ ...err.response.data, code: err.response.status });
    }
  }
  // Handle errors with the request
  if (err.request) {
    throw new Error(NoResponseMessage);
  }
  throw err;
};

/**
 * @class
 *
 * Provides both a pairing client (http) and a secure client (https) once paired.
 *
 * ## Format
 *
 * See server documentation for API requests & responses.
 *
 * In general, error responses take the shape:
 *
 * {
 *   "status": "error",
 *   "message": "..."
 * }
 *
 * Successful responses have a `data` key. With axios, responses also have a `data` property
 * representing the (JSON) response body, so parsing looks a little strange: `resp.data.data`.
 *
 * ## Cancellation
 *
 * All pending requests can be cancelled by calling cancelAll(). This will not reject the promised
 * response; rather, it will resolve with empty data.
 *
 * @param  {string|Object} pairingUrlOrPairedServer Either a pairing API URL (http), or an
 *                                                  already-paired Server
 * @param  {string} [pairingUrlOrPairedServer.secureServiceUrl] HTTPS url for secure endpoints,
 *                                                              if a paired server is provied
 */
class ApiClient {
  constructor(pairingUrlOrPairedServer) {
    let pairingUrl;
    let pairedServer;

    if (isString(pairingUrlOrPairedServer)) {
      // We have a pairing URL
      pairingUrl = pairingUrlOrPairedServer;
    } else if (pairingUrlOrPairedServer) {
      // We are already paired
      pairedServer = pairingUrlOrPairedServer;
    }

    this.cancelTokenSource = axios.CancelToken.source();
    this.pairedServer = pairedServer;
    if (pairingUrl) {
      this.pairingClient = axios.create({
        baseURL: pairingUrl.replace(/\/$/, ''),
        headers: defaultHeaders,
        // This timeout governs the time before the user clicks 'pair with device' in Server.
        // timeout: 15000,
      });
    }

    if (pairedServer && pairedServer.secureServiceUrl) {
      const secureURL = pairedServer.secureServiceUrl.replace(/\/$/, '');
      if (isCordova()) {
        const deviceId = pairedServer.deviceId;
        const cert = pairedServer.sslCertificate;
        this.httpsClient = new cordova.plugins.NetworkCanvasClient(deviceId, cert, secureURL);
      } else if (isElectron()) {
        this.httpsClient = axios.create({
          baseURL: secureURL,
          headers: defaultHeaders,
        });
      }
    }
  }

  /**
   * @description Call this to add add the paired server's SSL certificate to the trust store.
   * Calling this method without initializing the ApiClient with a paired server is an error.
   *
   * @method ApiClient#addTrustedCert
   * @async
   * @return {Promise} resolves if cert has been trusted;
   *                   rejects if there is no paired Server, or trust cannot be established
   */
  addTrustedCert() {
    if (!this.httpsClient) {
      return Promise.reject('No secure client available');
    }


    if (isCordova()) {
      return this.httpsClient.acceptCertificate().catch(handleError);
    } else if (isElectron()) {
      return new Promise((resolve, reject) => {
        if (!this.pairedServer || !this.pairedServer.sslCertificate) {
          reject(new Error('No trusted Server cert available'));
          return;
        }
        const { ipcRenderer } = require('electron'); // eslint-disable-line global-require
        ipcRenderer.once('add-cert-complete', resolve);
        ipcRenderer.send('add-cert', this.pairedServer.sslCertificate);
      });
    }
    return Promise.reject(new Error('SSL connections to Server are not supported on this platform'));
  }

  cancelAll() {
    this.cancelTokenSource.cancel();
  }

  get authHeader() {
    if (!this.pairedServer) {
      return null;
    }
    return { auth: { username: this.pairedServer.deviceId } };
  }

  /**
   * Get a new pairing code
   * @async
   * @return {Object} data
   * @return {Object.string} data.pairingRequestId
   * @return {Object.string} data.salt
   * @throws {Error}
   */
  requestPairing() {
    if (!this.pairingClient) {
      return Promise.reject('No pairing client available');
    }
    return this.pairingClient.get('/devices/new', { cancelToken: this.cancelTokenSource.token })
      .then(resp => resp.data)
      .then(json => json.data)
      .catch(handleError);
  }

  /**
   * Second step in pairing process
   * @param  {string} pairingCode User-entered (GUI)
   * @param  {string} pairingRequestId from the requestPairing() response
   * @param  {string} pairingRequestSalt from the requestPairing() response
   * @async
   * @return {Object} pairingInfo.device - decorated with the generated secret
   * @return {string} pairingInfo.device.id
   * @return {string} pairingInfo.device.secret
   * @return {string} pairingInfo.sslCertificate
   * @throws {Error}
   */
  confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName = '') {
    if (!this.pairingClient) {
      return Promise.reject('No pairing client available');
    }

    const saltBytes = fromHex(pairingRequestSalt);
    const secretBytes = deriveSecretKeyBytes(pairingCode, saltBytes);
    const secretHex = toHex(secretBytes);

    const plaintext = JSON.stringify({
      pairingRequestId,
      pairingCode,
      deviceName,
    });

    const encryptedMessage = encrypt(plaintext, secretHex);

    return this.pairingClient.post('/devices',
      {
        message: encryptedMessage,
      },
      {
        cancelToken: this.cancelTokenSource.token,
      })
      .then(resp => resp.data)
      .then(json => decrypt(json.data.message, secretHex))
      .then(JSON.parse)
      .then((decryptedData) => {
        if (!decryptedData.device || !decryptedData.device.id) {
          throw new Error(UnexpectedResponseMessage);
        }
        const device = decryptedData.device;
        device.secret = secretHex;
        return {
          device,
          sslCertificate: decryptedData.certificate,
          securePort: decryptedData.securePort,
        };
      })
      .catch(handleError);
  }

  /**
   * @async
   * @return {Array} protocols
   * @throws {Error}
   */
  getProtocols() {
    if (!this.httpsClient) {
      return Promise.reject('No secure client available');
    }

    return this.httpsClient.get('/protocols', { ...this.authHeader, cancelToken: this.cancelTokenSource.token })
      .then(resp => resp.data)
      .then(json => json.data)
      .catch(err => handleError(err));
  }

  downloadProtocol(path, destination) {
    if (!this.httpsClient) {
      return Promise.reject('No secure client available');
    }

    if (isCordova()) {
      return this.httpsClient.download(path, destination).catch(handleError);
    } else if (isElectron()) {
      return this.httpsClient
        .get(path, { ...this.authHeader, responseType: 'arraybuffer' })
        .then(resp => new Uint8Array(resp.data));
    }
    return Promise.reject(new Error('Downloads not supported on this platform'));
  }

  /**
   * @async
   * @param {string} protocolId ID of the protocol this session belongs to
   *                            (a sha256 digest of the protocol name, as hex)
   * @param {Object} sessionData
   * @param {String} sessionData.uuid (required)
   * @return {Object}
   * @throws {Error}
   */
  exportSession(protocolId, sessionId, sessionData) {
    const payload = {
      uuid: sessionId,
      data: sessionData,
    };
    return this.httpsClient.post(`/protocols/${protocolId}/sessions`, payload, this.authHeader)
      .then(resp => resp.data)
      .then(json => json.data)
      .catch(handleError);
  }
}

export default ApiClient;
