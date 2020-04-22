import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ApiClient from '../../utils/ApiClient';
import { ServerProtocolList, ServerSetup, PairedServerWrapper, ServerUnavailable } from '../../components/SetupScreen';


/**
 * @class
 * Renders a list of protocols, from which a user can choose to download.
 */
class ServerProtocols extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { pairedServer } = this.props;
    this.apiClient = new ApiClient(pairedServer);
    this.fetchProtocolList();
  }

  handleApiError(err) {
    this.setState({ error: err });
  }

  fetchProtocolList = () => {
    this.apiClient
      .addTrustedCert()
      .then(() => this.apiClient.getProtocols())
      .then(protocols => this.setState({ protocols }))
      .catch(err => this.handleApiError(err));
  }

  handleRetry = () => {
    this.setState({ error: null }, this.fetchProtocolList);
  }

  handleSelectProtocol = (protocol) => {
    this.props.importProtocolFromURI(protocol.downloadPath, true);
  }

  render() {
    const { error, protocols } = this.state;
    const { server } = this.props;

    let content = null;

    if (protocols) {
      content = (
        <ServerProtocolList
          protocols={protocols}
          selectProtocol={this.handleSelectProtocol}
        />
      );
    } // else still loading

    return (
      <PairedServerWrapper className="server-setup__card" data={server}>
        { error ?
          (
            <ServerUnavailable
              errorMessage={error.friendlyMessage || error.message}
              handleRetry={this.handleRetry}
            />
          ) : (
            <ServerSetup server={server} handleUnpair={this.handleUnpairRequest}>
              {content}
            </ServerSetup>
          )
        }
      </PairedServerWrapper>
    );
  }
}

ServerProtocols.propTypes = {
  importProtocolFromURI: PropTypes.func.isRequired,
  pairedServer: PropTypes.object.isRequired,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    pairedServer: state.pairedServer,
  };
}

export default connect(mapStateToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };
