/** @namespace serverAddressing */

const pairingApiProtocol = 'http';

const minPort = 1;
const maxPort = 65535;

const AllowIPv6 = false;
const isLinkLocal = addr => /^(fe80::|169\.254)/.test(addr);
const isIpv6 = addr => /^[a-zA-Z0-9]{1,4}:/.test(addr); // good enough for needs here

const parseUrl = (urlStr) => {
  try {
    return new URL(urlStr);
  } catch (err) {
    return null;
  }
};

// Performs basic escaping & checks using native (anchor) parsing.
const validApiUrl = (address, port) => {
  if (!address || isLinkLocal(address) || !port) {
    return null;
  }

  let portNum = port;
  if (typeof portNum !== 'number') {
    portNum = parseInt(portNum.toString(), 10);
  }
  if (portNum.toString() !== port.toString()) {
    return null;
  }
  if (portNum < minPort || portNum > maxPort) {
    return null;
  }

  let normalizedAddress = address;
  if (isIpv6(address)) {
    if (AllowIPv6) {
      normalizedAddress = `[${address}]`;
    } else {
      return null;
    }
  }

  const url = parseUrl(`${pairingApiProtocol}://${normalizedAddress}:${portNum}`);
  return url && url.hostname && url.port && url;
};

/**
 * Very lightweight validation of an address; intended to weed out user input
 * like full URLs, and link-local addresses.
 * @param  {string} address IP or hostname (without protocol, port, etc.)
 * @return {Boolean}
 * @memberOf serverAddressing
 */
const isValidAddress = address => !!validApiUrl(address, maxPort);

/**
 * @param  {number|*} port [description]
 * @return {Boolean}
 * @memberOf serverAddressing
 */
const isValidPort = port => !!validApiUrl('0.0.0.0', port);

/**
 * @typedef {Object} Service
 * @property {string} name
 * @property {string} host
 * @property {string} port
 * @property {Array} addresses
 * @property {string} apiUrl
 */

/**
 * Augments service information with an API URL, based on available
 * address and port information.
 * @param {Service} service discovered (via MDNS) or manually created server info
 * @memberOf serverAddressing
 */
// TODO: fix name; remove apiUrl
const addApiUrlToService = (service) => {
  const apiService = { ...service };
  let apiInfo = null;
  apiService.addresses.some((addr) => {
    apiInfo = validApiUrl(addr, service.port);
    return !!apiInfo;
  });
  apiService.apiUrl = apiInfo.toString();
  apiService.pairingServiceUrl = apiInfo.toString();
  return apiService;
};

/**
 * Augments an existing server, which has a pairingServiceUrl, with a secureServiceUrl.
 * Secure URLs are not available until the end of the pairing handshake.
 * @param  {Object} server
 * @param  {string} server.pairingServiceUrl
 * @param  {Number} securePort
 * @return {Object} the server, decorated with .secureServiceUrl
 */
const addSecureApiUrlToServer = (server, securePort = server.securePort) => {
  const secureUrl = new URL(server.pairingServiceUrl);
  if (!secureUrl) {
    console.warn('Missing pairingServiceUrl', server); // eslint-disable-line no-console
    return server;
  }
  secureUrl.protocol = 'https:';
  secureUrl.port = securePort;
  return {
    ...server,
    secureServiceUrl: secureUrl.toString(),
  };
};

export {
  addApiUrlToService,
  addSecureApiUrlToServer,
  pairingApiProtocol,
  isValidAddress,
  isValidPort,
  maxPort,
  minPort,
  parseUrl,
};
