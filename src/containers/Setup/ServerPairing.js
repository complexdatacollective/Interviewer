import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { decrypt, deriveSecretKeyBytes, encrypt, fromHex, toHex } from '../../utils/cipher';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { Scroller } from '../../components';
import { ProtocolCard, ServerCard, ServerPairingForm } from '../../components/Setup';

class ServerPairing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.requestPairingCode();
  }

  get apiUrl() {
    return this.props.server.apiUrl;
  }

  requestPairingCode() {
    fetch(`${this.apiUrl}/devices/new`)
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (!json.data.pairingRequestId) { throw new Error('Unexpected response'); }
        this.setState({
          pairingRequestId: json.data.pairingRequestId,
          pairingRequestSalt: json.data.salt,
        });
        console.info('Enter the pairing code');
      })
      .catch(console.error);
  }

  // Pairing step 2: derive a secret, send (encrypted) to server
  // TODO: higher-level API for pairing
  confirmPairing = () => {
    const { pairingCode, pairingRequestId, pairingRequestSalt } = this.state;
    const saltBytes = fromHex(pairingRequestSalt);
    const secretBytes = deriveSecretKeyBytes(pairingCode, saltBytes);
    const secretHex = toHex(secretBytes);

    const plaintext = JSON.stringify({
      pairingRequestId,
      pairingCode,
    });

    const encryptedMessage = encrypt(plaintext, secretHex);
    console.log('encrypted payload', encryptedMessage);

    fetch(`${this.apiUrl}/devices`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message: encryptedMessage,
        }),
      })
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then(json => decrypt(json.data.message, secretHex))
      .then(JSON.parse)
      .then((decryptedData) => {
        console.log('device can be paired', decryptedData);
        // TODO: Here's the point we'd want to persist ID + secret above
        this.setState({
          pairedDeviceId: decryptedData.device.id,
        });
      })
      .then(() => {
        this.fetchProtocolList();
      })
      .catch(console.error)
      .then(() => {
        this.setState({
          loading: false,
          pairingCode: null,
          pairingRequestId: null,
        });
      });
  }

  fetchProtocolList = () => {
    fetch(`${this.apiUrl}/protocols`)
      .then((resp) => {
        if (!resp.ok) { throw new Error('response not ok'); }
        return resp.json();
      })
      .then((json) => {
        console.log('protocols response', json);
        this.setState({ protocols: json.data });
      })
      .catch(console.error);
  }

  completePairing = (pairingCode) => {
    this.setState(
      { loading: true, pairingCode },
      () => setTimeout(this.confirmPairing, 0),
    );
  }

  render() {
    if (this.props.isProtocolLoaded) {
      const pathname = `/protocol/${this.props.protocolType}/${this.props.protocolPath}/0`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    const { server } = this.props;
    const { protocols } = this.state;

    return (
      <div className="server-pairing">
        <ServerCard className="server-pairing__card" data={server}>{server.name}</ServerCard>
        {
          this.state.pairingRequestId &&
          <ServerPairingForm className="server-pairing__form" completePairing={this.completePairing} loading={this.state.loading} />
        }
        <Scroller className="server-pairing__protocol-list">
          {
            protocols && protocols.map(protocol => (
              <ProtocolCard
                key={protocol.downloadUrl}
                download={this.props.downloadProtocol}
                protocol={protocol}
              />
            ))
          }
        </Scroller>
      </div>
    );
  }
}

ServerPairing.defaultProps = {
  protocolPath: '',
};

ServerPairing.propTypes = {
  downloadProtocol: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  server: PropTypes.shape({
    apiUrl: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    isFactory: state.protocol.isFactory,
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerPairing);

export { ServerPairing as UnconnectedServerPairing };
