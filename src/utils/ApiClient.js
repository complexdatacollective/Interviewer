import { decrypt, deriveSecretKeyBytes, encrypt, fromHex, toHex } from './shared-api/cipher';

const ApiErrorStatus = 'error';

// Error message to display when there's no usable message from server
const UnexpectedResponseMessage = 'Unexpected Response';

const isErrorJson = json => !json || !json.data || json.status === ApiErrorStatus;

// A throwable 'friendly' error containing message from server
const apiError = (respJson) => {
  const error = new Error('API error');
  if (respJson.message) {
    error.friendlyMessage = respJson.message;
    error.stack = null;
  }
  return error;
};

/**
 *
 */
class ApiClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
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
    return fetch(`${this.apiUrl}/devices/new`)
      .then(resp => resp.json())
      .then((json) => {
        if (isErrorJson(json) || !json.data.pairingRequestId || !json.data.salt) {
          throw apiError(json);
        }
        return json.data;
      });
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

    return fetch(`${this.apiUrl}/devices`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message: encryptedMessage,
        }),
      })
      .then(resp => resp.json())
      .then((json) => {
        if (isErrorJson(json)) {
          throw apiError(json);
        }
        return decrypt(json.data.message, secretHex);
      })
      .then(JSON.parse)
      .then((decryptedData) => {
        if (!decryptedData.device || !decryptedData.device.id) {
          throw new Error(UnexpectedResponseMessage);
        }
        return decryptedData.device;
      });
  }

  /**
   * @async
   * @return {Array} protocols
   * @throws {Error}
   */
  getProtocols() {
    return fetch(`${this.apiUrl}/protocols`)
      .then(resp => resp.json())
      .then((json) => {
        if (isErrorJson(json) || !Array.isArray(json.data)) {
          throw apiError(UnexpectedResponseMessage);
        }
        return json.data;
      });
  }
}

export default ApiClient;
