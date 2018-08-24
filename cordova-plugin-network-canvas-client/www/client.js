const exec = require('cordova/exec'); // eslint-disable-line import/no-unresolved

const ServiceName = 'NetworkCanvasClient';

const Actions = {
  acceptCertificate: 'acceptCertificate',
  download: 'download',
  send: 'send',
};

const respObject = (resp) => {
  let data;
  if (typeof resp === 'string') {
    try {
      data = JSON.parse(resp);
    } catch (err) {
      // Not JSON; likely a message coming from CordovaLib
      data = { message: resp, status: undefined };
    }
  } else {
    data = resp;
  }
  // Add data key to match axios interface
  return { data };
};

// Match axios interface: errors have an additional response prop
const respError = (resp) => {
  const response = respObject(resp);
  const err = new Error(response.data.message);
  err.response = response;
  return err;
};

class NetworkCanvasClient {
  constructor(deviceId, serverCertData, baseURL) {
    this.deviceId = deviceId;
    this.serverCert = serverCertData;
    this.baseURL = baseURL;
  }

  // @throws
  buildUrl(path) {
    return new URL(path, this.baseURL).href;
  }

  /**
   * @param  {string} cert PEM-formatted cert
   * @return {Promise} Resolves with undefined if accepted.
   *                   Rejects with error otherwise.
   */
  acceptCertificate(cert = this.serverCert) {
    return new Promise((resolve, reject) => {
      const sendArgs = [cert];
      exec(
        resolve,
        resp => reject(respError(resp)),
        ServiceName,
        Actions.acceptCertificate,
        sendArgs,
      );
    });
  }

  get(path) {
    return this.send(path);
  }

  post(path, data) {
    return this.send(path, 'POST', data);
  }

  /**
   * @async
   * @param  {string} path
   * @param  {string} method='GET'
   * @param  {Object} data serializable as JSON
   * @return {Promise} Resolves with the response object.
   *                   Rejects with an error object if any error occurs.
   */
  send(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const sendArgs = [this.deviceId, this.buildUrl(path), method];
      if (data) { sendArgs.push(JSON.stringify(data)); }

      exec(
        resp => resolve(respObject(resp)),
        resp => reject(respError(resp)),
        ServiceName,
        Actions.send,
        sendArgs);
    });
  }

  download(path, destination) {
    return new Promise((resolve, reject) => {
      const sendArgs = [this.deviceId, this.buildUrl(path), destination];
      exec(resolve, reject, ServiceName, Actions.download, sendArgs);
    });
  }
}

module.exports = NetworkCanvasClient;
