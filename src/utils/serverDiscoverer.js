import { EventEmitter } from 'eventemitter3';
import { isElectron, isCordova } from '../utils/Environment';

const DeviceApiProtocol = 'http';

const isLinkLocal = addr => /^(fe80::|169\.254)/.test(addr);
const isIpv6 = addr => /^[a-zA-Z0-9]{1,4}:/.test(addr); // TODO: good enough?

// TODO: this should be moved to address normalization in discoverer (along with above)
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
      this.events.emit('SERVER_ERROR', 'Automatic server discovery is not supported in the browser.');
      return;
    }

    if (!window.navigator.onLine) {
      this.events.emit('SERVER_ERROR', 'The Server Discovery service requires a network connection.');
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
          let apiUrl;
          service.addresses.some((addr) => {
            apiUrl = validDeviceUrl(addr, service.port);
            return !!apiUrl;
          });
          return {
            name,
            host,
            port,
            addresses,
            apiUrl,
          };
        };

        this.browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
        this.browser.on('serviceUp', service => this.events.emit('SERVER_ANNOUNCED', normalizeService(service)));
        this.browser.on('serviceDown', service => this.events.emit('SERVER_REMOVED', normalizeService(service)));
        this.browser.on('error', error => this.events.emit('SERVER_ERROR', error));
        this.browser.start();
      } catch (error) {
        this.events.emit('SERVER_ERROR', error);
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
            this.events.emit('SERVER_ANNOUNCED', normalizeService(result.service));
          } else {
            this.events.emit('SERVER_REMOVED', normalizeService(result.service));
          }
        }, error => this.events.emit('SERVER_ERROR', error));
      } catch (error) {
        this.events.emit('SERVER_ERROR', error);
      }
    }
  }
}

export default ServerDiscoverer;
