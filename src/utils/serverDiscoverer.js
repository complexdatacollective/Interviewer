import { EventEmitter } from 'eventemitter3';
import { isElectron, isCordova } from './Environment';
import { addPairingUrlToService } from './serverAddressing';

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
      // 'zeroconf.unwatch' is insufficient for cleanup
      this.zeroconf.close();
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
      this.emitErrorMessage('Automatic Server discovery requires a network connection. Make sure your device is connected to a network, and try again.');
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
          const {
            name,
            host,
            port,
            addresses,
          } = service;
          return {
            name,
            host,
            port,
            addresses,
          };
        };

        this.browser = mdns.createBrowser({ name: 'nc-server-6', protocol: 'tcp' });
        this.browser.on('serviceUp', (service) => this.emitAnnouncement(normalizeService(service)));
        this.browser.on('serviceDown', (service) => this.emitRemoval(normalizeService(service)));
        this.browser.on('error', (error) => this.emitErrorMessage(error));
        this.browser.start();
      } catch (error) {
        this.emitErrorMessage(error);
      }
    }

    if (isCordova()) {
      // eslint-disable-next-line @codaco/spellcheck/spell-checker
      console.log('Cordova zeroconf not implemented yet'); // eslint-disable-line no-console
      // this.zeroconf = window.cordova.plugins.zeroconf;
      // try {
      //      // Service name must also be updated in config.xml for iOS 14 permissions
      //   this.zeroconf.watch('_nc-server-6._tcp.', 'local.', (result) => {
      //     const { action } = result;
      //     // Normalize the service object to match the mdns node module (above)
      //     const normalizeService = (service) => (
      //       {
      //         name: service.name,
      //         host: service.hostname,
      //         port: service.port,
      //         addresses: [...service.ipv4Addresses, ...service.ipv6Addresses],
      //       }
      //     );

      //     if (action === 'added') {
      //       // Do nothing - we need a resolution which provides an IP address.
      //     } else if (action === 'resolved') {
      //       this.emitAnnouncement(normalizeService(result.service));
      //     } else {
      //       this.emitRemoval(normalizeService(result.service));
      //     }
      //   }, (error) => this.emitErrorMessage(error));
      // } catch (error) {
      //   this.emitErrorMessage(error);
      // }
    }
  }

  /**
   * Emits a {@link Server} object
   */
  emitAnnouncement(normalizedService) {
    const service = addPairingUrlToService(normalizedService);
    if (!service.pairingServiceUrl) {
      console.warn('No pairing URL found', service); // eslint-disable-line no-console
      return;
    }
    this.events.emit('SERVER_ANNOUNCED', service);
  }

  emitRemoval(normalizedService) {
    this.events.emit('SERVER_REMOVED', normalizedService);
  }

  emitErrorMessage(error) {
    // eslint-disable-next-line no-console
    console.log('serverDiscoverer Error:', error);
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
