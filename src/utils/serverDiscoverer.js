import { EventEmitter } from 'eventemitter3';
import { isElectron, isCordova } from '../utils/Environment';


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

    if (isCordova()) {
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
