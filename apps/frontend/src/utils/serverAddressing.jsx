/** @namespace serverAddressing */

const pairingApiProtocol = 'http';

const minPort = 1;
const maxPort = 65535;

const isLinkLocal = (addr) => /^(fe80::|169\.254)/.test(addr);
// We'll need to use [] notation if not already in that form; regex are good enough for needs here
// Note scope ID and zone index (for link-local) are not supported.
const isUnbracketedIpv6 = (addr) => /^[a-f0-9]{1,4}:/i.test(addr) || /^::[a-f0-9]{1,4}/i.test(addr);

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

  let normalizedAddress = encodeURI(address);
  if (isUnbracketedIpv6(normalizedAddress)) {
    normalizedAddress = `[${normalizedAddress}]`;
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
const isValidAddress = (address) => !!validApiUrl(address, maxPort);

/**
 * @param  {number|*} port [description]
 * @return {Boolean}
 * @memberOf serverAddressing
 */
const isValidPort = (port) => !!validApiUrl('0.0.0.0', port);

/**
 * @typedef {Object} Service
 * @property {string} name
 * @property {string} host
 * @property {string} port
 * @property {Array} addresses
 */

/**
 * Augments service information with an API URL, based on available
 * address and port information.
 * @param {Service} service discovered (via MDNS) or manually created server info
 * @memberOf serverAddressing
 */
const addPairingUrlToService = (service) => {
  const apiService = { ...service };
  let apiInfo = null;
  apiService.addresses.some((addr) => {
    apiInfo = validApiUrl(addr, service.port);
    return !!apiInfo;
  });
  apiService.pairingServiceUrl = apiInfo && apiInfo.toString();
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
  addPairingUrlToService,
  addSecureApiUrlToServer,
  pairingApiProtocol,
  isValidAddress,
  isValidPort,
  maxPort,
  minPort,
  parseUrl,
};
