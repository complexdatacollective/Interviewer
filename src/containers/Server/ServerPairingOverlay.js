import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ApiClient from '../../utils/ApiClient';
import { addSecureApiUrlToServer } from '../../utils/serverAddressing';
import { actionCreators } from '../../ducks/modules/pairedServer';

const initialState = {
  loading: false,
  pairingCode: null,
  pairingRequestSalt: null,
  pairingRequestId: null,
};

/**
 * This component is responsible for pairing with a server selected or entered by the user
 */
const ServerPairingOverlay = ({
  deviceName,
  setPairedServer,
  onComplete,
  onCancel,
}) => {
  const [{
    loading,
    pairingCode,
    pairingRequestSalt,
    pairingRequestId,
  }, setState,
  ] = useState(initialState);

  let apiClient;

  const handleApiError = (err) => {
    console.log('api error', err);
    // this.setState(emptyState);
    // this.props.onError(err);
    // Dispatch error action?
  };

  const requestPairingCode = () => {
    setState(prevState => ({ ...prevState, loading: true }));
    apiClient.requestPairing()
      .then((data) => {
        if (!data) {
          // we aborted the request during unmount
          return;
        }

        setState(prevState => ({
          ...prevState,
          loading: false,
          pairingRequestSalt: data.salt,
          pairingRequestId: data.pairingRequestId,
        }));
      })
      .catch(err => handleApiError(err));
  };

  // Pairing step 2: derive a secret, send (encrypted) to server
  // At this point, we have a known connection to LAN server. 'loading' state would only distract.
  const confirmPairing = () => {
    apiClient.confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName)
      .then((pairingInfo) => {
        const device = pairingInfo.device;
        const server = addSecureApiUrlToServer({
          ...props.server,
          securePort: pairingInfo.securePort,
          sslCertificate: pairingInfo.sslCertificate,
        });
        setState({ ...initialState });
        setPairedServer(server, device.id, device.secret);
      })
      .then(() => onComplete())
      .catch(err => handleApiError(err));
  };

  const completePairing = (code) => {
    setState(prevState => ({
      ...prevState,
      pairingCode: code,
    }));

    confirmPairing();
  };

  useEffect(() => {
    apiClient = new ApiClient(this.props.server.pairingServiceUrl);
    requestPairingCode();

    return () => {
      apiClient.cancelAll();
    };
  }, []);

  return (
    <ServerSetup server={server}>
    {
      <ServerPairingForm
        className="server-pairing__form"
        completePairing={this.completePairing}
        loading={loading}
        onCancel={onCancel}
      />
    }
  </ServerSetup>
  )
}




ServerPairingOverlay.defaultProps = {
  deviceName: '',
  onComplete: () => {},
  onError: () => {},
};

ServerPairingOverlay.propTypes = {
  deviceName: PropTypes.string,
  onComplete: PropTypes.func,
  onError: PropTypes.func,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
    host: PropTypes.string,
  }).isRequired,
  setPairedServer: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    deviceName: state.deviceSettings.description,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setPairedServer: bindActionCreators(actionCreators.setPairedServer, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerPairingOverlay);

export { ServerPairingOverlay as UnconnectedServerPairingOverlay };
