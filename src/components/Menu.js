/* globals cordova */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { Icon } from '../ui/components';
import { MenuItem, Scroller } from './';

import { isCordova } from '../utils/Environment';

import ApiClient from '../utils/ApiClient';

// const b64EncodeUnicode = str => btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
//   (match, p1) => String.fromCharCode(`0x${p1}`),
// ));

const serverAddr = '192.168.1.4';

const testPlugin = () => {
  const pairingServiceUrl = `https://${serverAddr}:51002`;
  // TODO: this is available from redux: servers.paired[].deviceId
  const deviceId = '5b1ac0e7-c896-405f-bab0-8b778ab1b6eb';
  // TODO: from redux
  const endpointUrl = '/protocols';
  // TODO: this is available from redux: servers.paired[].publicCert
  const cert = `-----BEGIN CERTIFICATE-----
MIIDBjCCAe6gAwIBAgIJb4Mq75vZ4WcqMA0GCSqGSIb3DQEBCwUAMCUxIzAhBgNV
BAMTGk5ldHdvcmsgQ2FudmFzIChsb2NhbGhvc3QpMB4XDTE4MDgwNjE1NTQzMFoX
DTI4MDgwMzE1NTQzMFowJTEjMCEGA1UEAxMaTmV0d29yayBDYW52YXMgKGxvY2Fs
aG9zdCkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCCLNWb6Fpu+Ggs
5sixcLB5c5nIBSj/OBjaSTps8h5JNOll2AZWQ1WDWNDIRwej8/uh6K20WWO3nvK2
9w/EodnH09+tBWHkFy/pGBAZCtJi6hzG9ED9FlcBMetfa8azh39fdvqDneKxc6fc
ppanYqThb6WVxm0Ghk5rnFKjEaVBpkGaxcbfFXJGZqmb5pSPH7eSv0A4wqBN92nY
K3Qvr2sbf1iB7OKwTcsN0H0NSPn2NDG6TIGgu3meEf+gfbWwKFuuP6FZQIDM4I4N
6r9ZIyoOvbgTutmOgFU9lXET8biH3W/1mZ9TJZgQT6NRCNLMWGOGIPlswpmv0xRg
X+/TV/yzAgMBAAGjOTA3MAwGA1UdEwQFMAMBAf8wCwYDVR0PBAQDAgL0MBoGA1Ud
EQQTMBGCCWxvY2FsaG9zdIcEfwAAATANBgkqhkiG9w0BAQsFAAOCAQEAJqI9TKX5
4SGjCmpLtttPeVYDjkXwx24v/JmaXoT6cl7Q65AYsVdRQbw8rl36qNkLbRi0Uc5C
suTPxrhXBfKQ6GgxaINaPnk7jBKjM84BOjFD1jPMh9pio7rfE7VCvvy7ODZwqWFV
KwtjoL1ya83a25CeZScTZbvOnJ+O3Pisbiy2mscv9zcgppRYJJf+oJnt1PbhN/P+
9DrG/wIxSUYQy7vmdN61mfVylvahL2hZqPkwVzJwS+n4i+pPRoNP57ErcvnimvCm
B2cJveDofiZPxFlJfSQGG/LCQAH/NVreP7y6s6kayQXy9zVO7S0fHxnkiIO5o+zh
40wpQ+77K/jLdw==
-----END CERTIFICATE-----
`;

  if (!isCordova()) {
    console.log('Electron test');
    const apiClient = new ApiClient({
      name: 'mb18.local',
      host: 'mb18.local.',
      port: 51001,
      addresses: [serverAddr],
      pairingServiceUrl,
      secureUrl: pairingServiceUrl.replace('51001', '51002').replace('http:', 'https:'),
      sslCertificate: cert,
      deviceId,
      deviceSecret: 'fe8f7b86c1749ce5471f4764c0c2e05846cc4539fb439dc07c5658e494e720b2',
    });
    apiClient
      .addTrustedCert()
      .then(() => apiClient.getProtocols())
      .then(protocols => console.log('Protocols', protocols))
      .catch(console.error);
    return;
  }

  const client = new cordova.plugins.NetworkCanvasClient(deviceId, cert, pairingServiceUrl);
  client.acceptCertificate(cert)
    .then(res => console.log('acceptCertificate response', res))
    .then(() => client.send(endpointUrl))
    .then(res => console.log('server response', res))
    .catch(err => console.error('promise chain err', err));
};

const closeEvents = [
  'click',
  'touchstart',
];

/**
  * Renders a menu, updating styles on DOM elements outside of this.
  * @extends Component
  */
class MenuFactory extends Component {
  constructor(props) {
    super(props);

    this.outsideClick = debounce(this.outsideClick, 50);
  }

  /**
    * adds listener for key events to close Menu
    */
  componentDidMount() {
    document.addEventListener('keydown', this.listenForClose, true);
  }

  componentDidUpdate() {
    closeEvents.forEach((eventName) => {
      if (this.props.isOpen) {
        document.addEventListener(eventName, this.outsideClick);
      } else {
        document.removeEventListener(eventName, this.outsideClick);
      }
    });
  }

  /**
    * removes listener for key events and click events to close Menu
    */
  componentWillUnmount() {
    document.removeEventListener('keydown', this.listenForClose);
    this.outsideClick.cancel();
  }

  listenForClose = (e) => {
    const event = e || window.event;

    if (this.props.isOpen && (event.key === 'Escape' || event.keyCode === 27)) {
      this.props.toggleMenu();
      e.stopPropagation();
    }
  }

  outsideClick = (e) => {
    if (!this.domNode.contains(e.target)) {
      this.props.toggleMenu(e);
    }
  }

  menuClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.toggleMenu();
  }

  // intercepts click events; calls callback and toggles Menu open state
  menuItemClick = (itemClick) => {
    this.menuClick();
    if (itemClick) itemClick();
  }

  render() {
    const { hideButton, icon, isOpen, items, searchField, title, children } = this.props;

    const menuItems = items.map(item =>
      (<MenuItem
        key={item.id}
        to={item.to}
        onClick={() => this.menuItemClick(item.onClick)}
        label={item.label}
        isActive={item.isActive}
        icon={item.icon}
        interfaceType={item.interfaceType}
        menuType={item.menuType}
      />),
    );

    menuItems.unshift(<MenuItem
      key={'test-plugin'}
      onClick={() => testPlugin()}
      label="API Send test"
    />);

    return (
      <div className="menu" ref={(node) => { this.domNode = node; }}>
        {children}
        <div className={isOpen ? 'menu__wrap menu__content menu__wrap--open' : 'menu__wrap menu__content'}>
          <Scroller className="menu__scroller">
            <Icon name="close" size="40px" className="menu__cross" onClick={this.menuClick} />
            <header>
              <h1 className="menu__title">{title}</h1>
            </header>
            {searchField}
            <nav>
              {menuItems}
            </nav>
          </Scroller>
        </div>
        {!hideButton && <Icon name={icon} className="menu__burger" onClick={this.menuClick} />}
      </div>
    );
  } // end render
} // end class

MenuFactory.propTypes = {
  hideButton: PropTypes.bool,
  icon: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  items: PropTypes.array,
  title: PropTypes.string,
  toggleMenu: PropTypes.func.isRequired,
  searchField: PropTypes.object,
  children: PropTypes.node,
};

MenuFactory.defaultProps = {
  hideButton: false,
  icon: 'menu',
  items: [],
  searchField: null,
  title: 'Options',
  children: null,
};

export default MenuFactory;
