/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

class ServerDiscoverer {
  constructor() {
    if (!isElectron() && !isCordova()) {
      return {
        on: () => { /* noop */ },
        off: () => { /* noop */ },
        init: () => { /* noop */ },
      };
    }

    const EventEmitter = require('eventemitter3');
    this.events = new EventEmitter();
  }

  on(...args) {
    this.events.on(...args);
  }


  off() {
    this.events.removeAllListeners();
    if (isElectron()) {
      this.browser.removeAllListeners();
      this.browser.stop();
    }

    if (isCordova()) {
      this.zeroconf.unwatch('_network-canvas._tcp.', 'local.');
    }
  }

  init() {
    if (navigator.onLine) {
      if (isElectron()) {
        try {
          const mdns = window.require('mdns');
          this.browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
          this.browser.on('serviceUp', service => this.events.emit('SERVER_ANNOUNCED', service));
          this.browser.on('serviceDown', service => this.events.emit('SERVER_REMOVED', service));
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
            const service = {
              name: result.service.name,
              interfaceIndex: null,
              host: result.service.hostname,
              port: result.service.port,
              addresses: [...result.service.ipv4Addresses, ...result.service.ipv6Addresses],
            };
            if (action === 'resolved') {
              this.events.emit('SERVER_ANNOUNCED', service);
            } else {
              this.events.emit('SERVER_REMOVED', service);
            }
          }, error => this.emit('SERVER_ERROR', error));
        } catch (error) {
          this.events.emit('SERVER_ERROR', error);
        }
      }
    } else {
      this.events.emit('SERVER_ERROR', new Error('The Server Discovery service requires a network connection.'));
    }
  }
}

export default ServerDiscoverer;
