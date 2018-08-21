import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ApiClient from '../../utils/ApiClient';
import { addSecureApiUrlToServer } from '../../utils/serverAddressing';
import { ServerSetup, ServerPairingForm } from '../../components/Setup';
import { actionCreators } from '../../ducks/modules/servers';

const emptyState = Object.freeze({
  loading: false,
  pairingCode: null,
  pairingRequestId: null,
});

/**
 * This component is responsible for pairing with a server selected or entered by the user
 */
class ServerPairing extends Component {
  constructor(props) {
    super(props);
    this.state = emptyState;
  }

  componentDidMount() {
    this.apiClient = new ApiClient(this.props.server.apiUrl);
    this.requestPairingCode();
  }

  componentWillUnmount() {
    this.apiClient.cancelAll();
  }

  handleApiError(err) {
    this.props.pairingFailed(err);
    this.setState(emptyState);
    this.props.onError(err);
  }

  requestPairingCode() {
    this.setState({ loading: true });
    this.apiClient.requestPairing()
      .then((data) => {
        if (!data) {
          // we aborted the request during unmount
          return;
        }
        this.setState({
          loading: false,
          pairingRequestId: data.pairingRequestId,
          pairingRequestSalt: data.salt,
        });
      })
      .catch(err => this.handleApiError(err));
  }

  // Pairing step 2: derive a secret, send (encrypted) to server
  // At this point, we have a known connection to LAN server. 'loading' state would only distract.
  confirmPairing = () => {
    const { pairingCode, pairingRequestId, pairingRequestSalt } = this.state;
    const { deviceName } = this.props;
    this.apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName)
      .then((pairingInfo) => {
        const device = pairingInfo.device;
        const server = addSecureApiUrlToServer({
          ...this.props.server,
          securePort: pairingInfo.securePort,
          sslCertificate: pairingInfo.sslCertificate,
        });
        this.props.addServer(server, device.id, device.secret);
        this.setState({
          ...emptyState,
          pairedDeviceId: device.id,
        });
      })
      .then(() => this.props.onComplete())
      .catch(err => this.handleApiError(err));
  }

  completePairing = (pairingCode) => {
    this.setState(
      { pairingCode },
      () => setTimeout(this.confirmPairing, 0),
    );
  }

  render() {
    const { server } = this.props;
    const { loading } = this.state;

    return (
      <ServerSetup server={server}>
        {
          <ServerPairingForm
            className="server-pairing__form"
            completePairing={this.completePairing}
            loading={loading}
          />
        }
      </ServerSetup>
    );
  }
}

ServerPairing.defaultProps = {
  deviceName: '',
  onComplete: () => {},
  onError: () => {},
};

ServerPairing.propTypes = {
  addServer: PropTypes.func.isRequired,
  deviceName: PropTypes.string,
  onComplete: PropTypes.func,
  onError: PropTypes.func,
  pairingFailed: PropTypes.func.isRequired,
  server: PropTypes.shape({
    apiUrl: PropTypes.string.isRequired,
    host: PropTypes.string,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    deviceName: state.device.description,
    isFactory: state.protocol.isFactory,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addServer: bindActionCreators(actionCreators.addServer, dispatch),
    pairingFailed: bindActionCreators(actionCreators.pairingFailed, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerPairing);

export { ServerPairing as UnconnectedServerPairing };
