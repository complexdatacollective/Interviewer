import { EventEmitter } from 'eventemitter3';
import { isElectron, isCordova } from '../utils/Environment';

const DeviceApiProtocol = 'http';

const isLinkLocal = addr => /^(fe80::|169\.254)/.test(addr);
const isIpv6 = addr => /^[a-zA-Z0-9]{1,4}:/.test(addr); // TODO: good enough?

const validDeviceUrl = (address, port) => {
  if (!address || isLinkLocal(address) || !port) {
    return null;
  }
  let normalizedAddress = address;
  if (isIpv6(address)) {
    normalizedAddress = `[${address}]`;
  }
  const a = document.createElement('a');
  a.href = `${DeviceApiProtocol}://${normalizedAddress}:${port}`;
  return a.hostname && a.port && a.href;
};

class ServerDiscoverer {
  constructor() {
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
    this.events = new EventEmitter();
  }

  on = (...args) => {
    this.events.on(...args);
  }

  removeAllListeners = () => {
    this.events.removeAllListeners();
    if (isElectron() && this.browser) {
      this.browser.removeAllListeners();
      this.browser.stop();
    }

    if (isCordova() && this.zeroconf) {
      this.zeroconf.unwatch('_network-canvas._tcp.', 'local.');
    }
  }

  handleNetworkChange = () => {
    if (window.navigator.onLine) {
      this.events.emit('SERVER_RESET');
    }
    this.checkEnvironment();
  }

  checkEnvironment = () => {
    if (!isElectron() && !isCordova()) {
      this.emitErrorMessage('Automatic server discovery is not supported in the browser.');
      return;
    }

    if (!window.navigator.onLine) {
      this.emitErrorMessage('The Server Discovery service requires a network connection.');
    }
  }

  init = () => {
    this.checkEnvironment();

    if (isElectron()) {
      try {
        const mdns = window.require('mdns');

        // Pick the properties we want from the service object
        // and provide a valid URL for the API if one is available
        const normalizeService = (service) => {
          const { name, host, port, addresses } = service;
          return {
            name,
            host,
            port,
            addresses,
          };
        };

        this.browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
        this.browser.on('serviceUp', service => this.emitAnnouncement(normalizeService(service)));
        this.browser.on('serviceDown', service => this.emitRemoval(normalizeService(service)));
        this.browser.on('error', error => this.emitErrorMessage(error));
        this.browser.start();
      } catch (error) {
        this.emitErrorMessage(error);
      }
    }

    if (isCordova()) {
      this.zeroconf = window.cordova.plugins.zeroconf;
      try {
        this.zeroconf.watch('_network-canvas._tcp.', 'local.', (result) => {
          const action = result.action;
          // Normalize the service object to match the mdns node module (above)
          const normalizeService = service => (
            {
              name: service.name,
              host: service.hostname,
              port: service.port,
              addresses: [...service.ipv4Addresses, ...service.ipv6Addresses],
            }
          );

          if (action === 'added') {
            // Do nothing - we need a resolution which provides an IP address.
          } else if (action === 'resolved') {
            this.emitAnnouncement(normalizeService(result.service));
          } else {
            this.emitRemoval(normalizeService(result.service));
          }
        }, error => this.emitErrorMessage(error));
      } catch (error) {
        this.emitErrorMessage(error);
      }
    }
  }

  /**
   * @typedef {Object} Server
   * @property {string} name
   * @property {string} host
   * @property {string} port
   * @property {Array} addresses
   * @property {string} apiUrl
   */

  /**
   * Emits a {@link Server} object
   */
  emitAnnouncement(normalizedService) {
    let apiUrl;
    const service = normalizedService;
    service.addresses.some((addr) => {
      apiUrl = validDeviceUrl(addr, service.port);
      return !!apiUrl;
    });
    if (!apiUrl) {
      console.warn('No apiUrl found', service); // eslint-disable-line no-console
      return;
    }
    service.apiUrl = apiUrl;
    this.events.emit('SERVER_ANNOUNCED', service);
  }

  emitRemoval(normalizedService) {
    this.events.emit('SERVER_REMOVED', normalizedService);
  }

  emitErrorMessage(error) {
    // Electron emits/throws Error objects, Android uses strings, iOS is null...
    // Normalize to a string, which is what consumer wants.
    let errorMessage;
    if (!error) {
      errorMessage = 'An unknown error occurred';
    } else if (errorMessage instanceof Error) {
      errorMessage = errorMessage.message;
    } else {
      errorMessage = error.toString();
    }
    this.events.emit('SERVER_ERROR', errorMessage);
  }
}

export default ServerDiscoverer;
