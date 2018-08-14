const exec = require('cordova/exec'); // eslint-disable-line import/no-unresolved

const ServiceName = 'NetworkCanvasClient';

const Actions = {
  acceptCertificate: 'acceptCertificate',
  send: 'send',
};

const respObject = (resp) => {
  let data;
  // TODO: can ever be Error type? (not clear from cordova docs)
  if (typeof resp === 'string') {
    data = JSON.parse(resp);
  } else {
    data = resp;
  }
  // Add data key to match axios interface
  return { data };
};

// Match axios interface: errors have an additional response prop
const respError = (resp) => {
  const response = respObject(resp);
  const err = new Error(response.message);
  err.response = response;
  return err;
};

class NetworkCanvasClient {
  constructor(deviceId, serverCertData, baseURL) {
    this.deviceId = deviceId;
    this.serverCert = serverCertData;
    this.baseURL = baseURL;
  }

  buildUrl(path) {
    // TODO: robustness; use existing helpers?
    return `${this.baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  acceptCertificate(cert = this.serverCert) {
    return new Promise((resolve, reject) => {
      const sendArgs = [cert];
      exec(resolve, reject, ServiceName, Actions.acceptCertificate, sendArgs);
    });
  }

  get(path) {
    return this.send(path);
  }

  post(path, data) {
    return this.send(path, 'POST', data);
  }

  send(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const sendArgs = [this.deviceId, this.buildUrl(path), method];
      if (data) { sendArgs.push(JSON.stringify(data)); }

      return exec(
        resp => resolve(respObject(resp)),
        resp => reject(respError(resp)),
        ServiceName,
        Actions.send,
        sendArgs);
    });
  }
}

module.exports = NetworkCanvasClient;
