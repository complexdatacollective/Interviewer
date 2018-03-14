/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

class ServerDiscoverer {
  constructor() {
    if (!isElectron() && !isCordova()) {
      return { on: () => { /* noop */ } };
    }

    const EventEmitter = require('eventemitter3');
    this.events = new EventEmitter();
  }

  on(...args) {
    this.events.on(...args);
  }

  init() {
    if (isElectron()) {
      try {
        const mdns = window.require('mdns');
        const browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
        browser.on('serviceUp', service => this.events.emit('SERVER_ANNOUNCED', service));
        browser.on('serviceDown', service => this.events.emit('SERVER_REMOVED', service));
        browser.on('error', error => this.events.emit('SERVER_ERROR', error));
        browser.start();
      } catch (error) {
        this.events.emit('SERVER_ERROR', error);
      }
    }

    if (isCordova()) {
      const zeroconf = window.cordova.plugins.zeroconf;
      try {
        zeroconf.watch('_network-canvas._tcp.', 'local.', (result) => {
          const action = result.action;
          const service = result.service;
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
  }
}

export default ServerDiscoverer;
