import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ApiClient from '../../utils/ApiClient';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { ServerProtocolList, ServerSetup, ServerUnavailable } from '../../components/Setup';

/**
 * @class
 * Renders a list of protocols, from which a user can choose to download.
 */
class ServerProtocols extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewSessionOverlay: false,
    };
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
    const { installProtocolFromURI } = this.props;
    this.setState({ showNewSessionOverlay: true });
    this.apiClient.addTrustedCert()
      .then(() => installProtocolFromURI(protocol.downloadPath, true));
  }

  handleUnpairRequest = () => {
    this.props.openDialog({
      type: 'Warning',
      title: 'Unpair this Server?',
      confirmLabel: 'Unpair Server',
      onConfirm: this.props.unpairServer,
      message: (
        <p>
          This will remove this Server from the app.
          You will have to re-pair to import protocols or export data.
          Are you sure you want to continue?
        </p>
      ),
    });
  }

  handleCloseOverlay = () => {
    this.setState({ showNewSessionOverlay: false });
  }

  render() {
    const { error, protocols } = this.state;
    const { server } = this.props;

    let content = null;
    if (error) {
      content = (
        <ServerUnavailable
          errorMessage={error.friendlyMessage || error.message}
          handleRetry={this.handleRetry}
        />
      );
    } else if (protocols) {
      content = (
        <ServerProtocolList
          protocols={protocols}
          selectProtocol={this.handleSelectProtocol}
        />
      );
    } // else still loading

    return (
      <React.Fragment>
        <ServerSetup server={server} handleUnpair={this.handleUnpairRequest}>
          {content}
        </ServerSetup>
      </React.Fragment>
    );
  }
}

ServerProtocols.defaultProps = {
  protocolPath: '',
};

ServerProtocols.propTypes = {
  installProtocolFromURI: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
  pairedServer: PropTypes.object.isRequired,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
  }).isRequired,
  unpairServer: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolPath: state.importProtocol.path,
    pairedServer: state.pairedServer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    installProtocolFromURI:
    bindActionCreators(protocolActions.installProtocolFromURI, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };
