import React, { Component } from 'react';

// For protoype loading URL into form:
import { connect } from 'react-redux';
import { change } from 'redux-form';

// For encryption proto/spike:
import libsodium from 'libsodium-wrappers';

import { Button, Icon, Spinner } from '../ui/components';
import ServerDiscoverer from '../utils/serverDiscoverer';
import ServerCard from '../components/ServerCard';

const DeviceApiProtocol = 'http';

const isLinkLocal = addr => /^(fe80::|169\.254)/.test(addr);
const isIpv6 = addr => /^[a-zA-Z0-9]{1,4}:/.test(addr); // TODO: good enough?

// TODO: this should be moved to address normalization in discoverer
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

const exampleSymmetricCrypt = (secret) => {
  // example encryption...
  const message = 'Network Canvas Server';
  const nonce = libsodium.randombytes_buf(libsodium.crypto_secretbox_NONCEBYTES);
  const cipher = libsodium.crypto_secretbox_easy(message, nonce, secret);

  // nonce can be sent in the clear, so here's the entire message:
  const noncePlusCipher = new Uint8Array(nonce.length + cipher.length);
  noncePlusCipher.set(nonce);
  noncePlusCipher.set(cipher, nonce.length);

  // see API docs: https://github.com/jedisct1/libsodium.js
  const minLength = libsodium.crypto_secretbox_NONCEBYTES + libsodium.crypto_secretbox_MACBYTES;
  if (noncePlusCipher.length < minLength) {
    throw new Error('Message too short');
  }

  // example decryption...
  const receivedNonce = noncePlusCipher.slice(0, libsodium.crypto_secretbox_NONCEBYTES);
  const receivedCipher = noncePlusCipher.slice(libsodium.crypto_secretbox_NONCEBYTES);
  const retrievedBytes = libsodium.crypto_secretbox_open_easy(receivedCipher,
    receivedNonce, secret);
  const retrievedMessage = libsodium.to_string(retrievedBytes);

  return retrievedMessage === message;
};

const testSodium = () => {
  const secret = '070cdd077fd2beb11bc2ad22c3e11ef46210c14736112c325c16db389c665398';
  console.log('test sodium ok?', exampleSymmetricCrypt(libsodium.from_hex(secret)));
};


class ServerList extends Component {
  constructor() {
    super();

    this.state = {
      error: null,
      servers: [],
    };
  }
  componentDidMount() {
    this.initServer();
  }

  componentDidUpdate() {
    // Give some console output about the error, just for debugging.
    if (this.state.error) {
      // eslint-disable-next-line
      console.warn(this.state.error);
    }
  }

  componentWillUnmount() {
    this.serverDiscoverer.removeAllListeners();
  }

  onPairingCodeChange = (evt) => {
    this.setState({
      pairingCode: evt.target.value,
    });
  }

  onClickServer = (evt, data) => {
    console.log('onClickServer', data, evt);

    let url;
    data.addresses.some((addr) => {
      url = validDeviceUrl(addr, data.port);
      return !!url;
    });

    if (!url) {
      console.warn('No api url available');
      return;
    }

    console.log('apiUrl', url);
    this.setState({
      apiUrl: url,
    });

    fetch(`${url}/devices/new`)
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (!json.data.pairingRequestId) { throw new Error('Unexpected response'); }
        this.setState({
          pairingRequestId: json.data.pairingRequestId,
        });
        console.info('Enter the pairing code');
      })
      .catch(console.error);
  }

  sendConfirm = () => {
    const { apiUrl, pairingCode, pairingRequestId } = this.state;
    console.log('sendConfirm', apiUrl, pairingCode, pairingRequestId);
    fetch(`${apiUrl}/devices`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          pairingRequestId,
          pairingCode,
        }),
      })
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then((json) => {
        console.log('device is paired', json);
        this.setState({
          pairingCode: null,
          pairingRequestId: null,
          pairedDeviceId: json.data.device.id,
        });
      })
      .catch(console.error);
  }

  fetchProtocolList = () => {
    const { apiUrl } = this.state;
    fetch(`${apiUrl}/protocols`)
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then((json) => {
        console.log('protocols response', json);
        this.setState({ protocols: json.data }, () => console.log('ss cb', this.state));
      })
      .catch(console.error);
  }

  bindServerEvents = () => {
    if (!this.serverDiscoverer) { return; }

    this.serverDiscoverer.on('SERVER_RESET', () => {
      this.setState({
        error: null,
      });
    });

    this.serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      if (!response.name) { return; }

      const servers = this.state.servers.slice();
      // Detect if we already have a service with this name
      const serverIndex = this.state.servers.findIndex(server => response.name === server.name);
      if (serverIndex === -1) {
        servers.push(response);
      } else {
        servers[serverIndex] = response;
      }
      this.setState(() => ({ servers }));
    });

    this.serverDiscoverer.on('SERVER_REMOVED', (response) => {
      this.setState(prevState => ({
        servers: prevState.servers.filter(item => (item.name !== response.name)),
      }));
    });

    this.serverDiscoverer.on('SERVER_ERROR', (error) => {
      this.setState({ error });
    });
  }

  initServer = () => {
    try {
      this.serverDiscoverer = new ServerDiscoverer();
      this.bindServerEvents();
      this.serverDiscoverer.init();
    } catch (error) {
      this.setState({ error });
    }
  }

  renderServerList() {
    if (this.state.servers.length > 0) {
      return (
        <div>
          {this.state.servers.map(server => (
            <ServerCard data={server} onSelectServer={this.onClickServer}>{server.name}</ServerCard>
          ))}
          {
            this.state.pairingRequestId &&
              <React.Fragment>
                <input type="text" value={this.state.pairingCode} onChange={this.onPairingCodeChange} />
                <button onClick={this.sendConfirm}>Send Confirm</button>
              </React.Fragment>
          }
          {
            this.state.pairedDeviceId && !this.state.protocols &&
              <React.Fragment>
                <p>Pairing complete!</p>
                <p>
                  Device ID:
                  {this.state.pairedDeviceId.substr(0, 6)}...
                </p>
                <p><button onClick={this.fetchProtocolList}>List Protocols</button></p>
              </React.Fragment>
          }
          {
            this.state.protocols &&
            <React.Fragment>
              <h3>Protocols:</h3>
              <ul>
                { this.state.protocols.map(p => (
                  <li>
                    {p.name} @ {p.version}

                    {/* eslint-disable-next-line */}
                    <a href onClick={() => this.props.change('setup', 'protocol_url', p.downloadUrl)}>URL</a>
                  </li>
                ))}
              </ul>
            </React.Fragment>
          }
        </div>
      );
    }

    return (<div className="server-list__placeholder"><Spinner /><h4>Listening for nearby Servers...</h4></div>);
  }

  render() {
    testSodium();
    return (
      <div className="server-list">
        <div className="server-list__content">
          {this.state.error ?
            (
              <div className="server-list__placeholder">
                <Icon name="error" />
                <h4>Automatic server discovery unavailable</h4>
                { // eslint-disable-next-line no-alert
                }<Button size="small" onClick={() => alert(this.state.error)}>why?</Button>
              </div>
            )
            :
            this.renderServerList()
          }
        </div>
      </div>
    );
  }
}

export default connect(null, { change })(ServerList);
