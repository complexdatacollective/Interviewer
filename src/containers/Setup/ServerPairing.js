import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { ProtocolCardList, ServerCard, ServerPairingForm } from '../../components/Setup';
import ApiClient from '../../utils/ApiClient';

// TODO: user-friendly error messaging
const handleApiError = err => console.error(err); // eslint-disable-line no-console

class ServerPairing extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.apiClient = new ApiClient(this.props.server.apiUrl);
    this.requestPairingCode();
  }

  requestPairingCode() {
    this.apiClient.requestPairing()
      .then((data) => {
        this.setState({
          pairingRequestId: data.pairingRequestId,
          pairingRequestSalt: data.salt,
        });
      })
      .catch(handleApiError);
  }

  // Pairing step 2: derive a secret, send (encrypted) to server
  confirmPairing = () => {
    const { pairingCode, pairingRequestId, pairingRequestSalt } = this.state;
    this.apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt)
      .then((device) => {
        // TODO: Here's the point we'd want to persist ID + secret above
        this.setState({
          pairedDeviceId: device.id,
        });
      })
      .then(this.fetchProtocolList)
      .catch(handleApiError)
      .then(() => {
        this.setState({
          loading: false,
          pairingCode: null,
          pairingRequestId: null,
        });
      });
  }

  fetchProtocolList = () => {
    this.apiClient.getProtocols()
      .then(protocols => this.setState({ protocols }))
      .catch(handleApiError);
  }

  completePairing = (pairingCode) => {
    this.setState(
      {
        loading: true,
        pairingCode,
      },
      () => setTimeout(this.confirmPairing, 0),
    );
  }

  render() {
    if (this.props.isProtocolLoaded) {
      const pathname = `/protocol/${this.props.protocolType}/${this.props.protocolPath}/0`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    const { server, downloadProtocol } = this.props;
    const { protocols } = this.state;

    return (
      <div className="server-pairing">
        <ServerCard className="server-pairing__card" data={server}>{server.name}</ServerCard>
        {
          this.state.pairingRequestId &&
          <ServerPairingForm
            className="server-pairing__form"
            completePairing={this.completePairing}
            disabled={this.state.loading}
          />
        }
        {
          protocols && (
            <ProtocolCardList protocols={protocols} download={downloadProtocol} />
          )
        }
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
