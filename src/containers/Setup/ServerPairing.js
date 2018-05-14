import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ApiClient from '../../utils/ApiClient';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { ProtocolCardList, ServerCard, ServerPairingForm } from '../../components/Setup';
import { Spinner } from '../../ui/components';

const emptyState = Object.freeze({
  loading: false,
  pairingCode: null,
  pairingRequestId: null,
});

class ServerPairing extends Component {
  constructor(props) {
    super(props);
    this.state = emptyState;
  }

  componentDidMount() {
    this.apiClient = new ApiClient(this.props.server.apiUrl);
    this.requestPairingCode();
  }

  handleApiError(err) {
    this.props.downloadProtocolFailed(err); // Show message to user
    this.setState(emptyState);
    this.props.onError(err); // Signal parent
  }

  requestPairingCode() {
    this.setState({ loading: true });
    this.apiClient.requestPairing()
      .then((data) => {
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
    this.apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt)
      .then((device) => {
        // TODO: Here's the point we'd want to persist ID + secret above
        this.setState({
          ...emptyState,
          pairedDeviceId: device.id,
        });
      })
      .then(this.fetchProtocolList)
      .catch(err => this.handleApiError(err));
  }

  fetchProtocolList = () => {
    this.apiClient.getProtocols()
      .then(protocols => this.setState({ protocols }))
      .catch(err => this.handleApiError(err));
  }

  completePairing = (pairingCode) => {
    this.setState(
      { pairingCode },
      () => setTimeout(this.confirmPairing, 0),
    );
  }

  render() {
    if (this.props.isProtocolLoaded) {
      const pathname = `/protocol/${this.props.protocolType}/${this.props.protocolPath}/0`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    const { server, downloadProtocol } = this.props;
    const { loading, protocols } = this.state;

    if (loading) {
      return (
        <div className="server-pairing__loading">
          <Spinner />
        </div>
      );
    }

    return (
      <div className="server-pairing">
        <ServerCard className="server-pairing__card" data={server}>{server.host}</ServerCard>
        {
          this.state.pairingRequestId &&
          <ServerPairingForm
            className="server-pairing__form"
            completePairing={this.completePairing}
            disabled={this.state.loading}
          />
        }
        {
          protocols && <ProtocolCardList protocols={protocols} download={downloadProtocol} />
        }
      </div>
    );
  }
}

ServerPairing.defaultProps = {
  onError: () => {},
  protocolPath: '',
};

ServerPairing.propTypes = {
  downloadProtocol: PropTypes.func.isRequired,
  downloadProtocolFailed: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  onError: PropTypes.func,
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
    downloadProtocolFailed: bindActionCreators(protocolActions.downloadProtocolFailed, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerPairing);

export { ServerPairing as UnconnectedServerPairing };
