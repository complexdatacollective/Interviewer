import axios from 'axios';

import { decrypt, deriveSecretKeyBytes, encrypt, fromHex, toHex } from './shared-api/cipher';

// Error message to display when there's no usable message from server
const UnexpectedResponseMessage = 'Unexpected Response';
const NoResponseMessage = 'Unexpected Response';

// A throwable 'friendly' error containing message from server
const apiError = (respJson) => {
  const error = new Error('API error');
  if (respJson.message) {
    error.friendlyMessage = respJson.message;
    error.stack = null;
  }
  return error;
};

const handleError = (err) => {
  if (err.response) {
    throw apiError(err.response.data);
  }
  if (err.request) {
    throw new Error(NoResponseMessage);
  }
  throw err;
};

/**
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
 */
class ApiClient {
  constructor(apiUrl) {
    this.client = axios.create({
      baseURL: apiUrl.replace(/\/$/, ''),
    });
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
    return this.client.get('/devices/new')
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
   * @return {Object} device
   * @return {string} device.id
   * @throws {Error}
   */
  confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName = '') {
    const saltBytes = fromHex(pairingRequestSalt);
    const secretBytes = deriveSecretKeyBytes(pairingCode, saltBytes);
    const secretHex = toHex(secretBytes);

    const plaintext = JSON.stringify({
      pairingRequestId,
      pairingCode,
      deviceName,
    });

    const encryptedMessage = encrypt(plaintext, secretHex);

    return this.client.post('/devices',
      {
        message: encryptedMessage,
      })
      .then(resp => resp.data)
      .then(json => decrypt(json.data.message, secretHex))
      .then(JSON.parse)
      .then((decryptedData) => {
        if (!decryptedData.device || !decryptedData.device.id) {
          throw new Error(UnexpectedResponseMessage);
        }
        return decryptedData.device;
      })
      .catch(handleError);
  }

  /**
   * @async
   * @return {Array} protocols
   * @throws {Error}
   */
  getProtocols() {
    return this.client.get('/protocols')
      .then(resp => resp.data)
      .then(json => json.data)
      .catch(handleError);
  }
}

export default ApiClient;
