/** @namespace serverAddressing */

const apiProtocol = 'http';

const minPort = 1;
const maxPort = 65535;

const AllowIPv6 = false;
const isLinkLocal = addr => /^(fe80::|169\.254)/.test(addr);
const isIpv6 = addr => /^[a-zA-Z0-9]{1,4}:/.test(addr); // good enough for needs here

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
  const a = document.createElement('a');
  a.href = `${apiProtocol}://${normalizedAddress}:${portNum}`;

  // Disallow URLs if parsed to contain certain fields
  if (a.pathname && a.pathname !== '/') { return null; }
  if (a.hash || a.username || a.password) { return null; }
  return a.hostname && a.href;
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
const addApiUrlToService = (service) => {
  const apiService = { ...service };
  let apiUrl = null;
  apiService.addresses.some((addr) => {
    apiUrl = validApiUrl(addr, service.port);
    return !!apiUrl;
  });
  apiService.apiUrl = apiUrl;
  return apiService;
};

export {
  addApiUrlToService,
  apiProtocol,
  isValidAddress,
  isValidPort,
  maxPort,
  minPort,
};
