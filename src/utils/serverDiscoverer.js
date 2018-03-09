/* eslint-disable global-require */

import { isElectron, isCordova } from '../utils/Environment';

class ServerDiscoverer {
  constructor() {
    if (!isElectron() && !isCordova()) {
      return { on: () => { /* noop */ } };
    }

    const EventEmitter = require('eventemitter3');
    this.events = new EventEmitter();

    if (isElectron()) {
      try {
        const mdns = window.require('mdns');
        const browser = mdns.createBrowser({ name: 'network-canvas', protocol: 'tcp' });
        console.info('MDNS browser running.');
        console.log(browser);
        browser.on('serviceUp', service => this.events.emit('SERVICE_ANNOUNCED', service));
        browser.on('serviceDown', service => this.events.emit('SERVICE_REMOVED', service));
        browser.on('error', error => this.events.emit('ERROR', error));
        browser.start();
      } catch (error) {
        this.events.emit('ERROR', error);
      }
    }

    if (isCordova()) {
      const zeroconf = window.cordova.plugins.zeroconf;
      try {
        zeroconf.watch('_network-canvas._tcp.', 'local.', (result) => {
          const action = result.action;
          const service = result.service;
          if (action === 'resolved') {
            this.events.emit('SERVICE_ANNOUNCED', service);
          } else {
            this.events.emit('SERVICE_REMOVED', service);
          }
        }, error => this.emit('ERROR', error));
        console.info('Zeroconf browser running.');
        console.log(zeroconf);
      } catch (error) {
        this.events.emit('ERROR', error);
      }
    }
  }

  on(...args) {
    this.events.on(...args);
  }
}

export default ServerDiscoverer;
