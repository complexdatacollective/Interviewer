import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ApiClient from '../../utils/ApiClient';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { NewSessionOverlay, ServerProtocolList, ServerSetup, ServerUnavailable } from '../../components/Setup';

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
    const { downloadProtocol } = this.props;
    this.setState({ showNewSessionOverlay: true });
    this.apiClient.addTrustedCert()
      .then(() => downloadProtocol(protocol.downloadPath, true));
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

  handleCreateSession = (caseId) => {
    this.props.addSession(caseId);
    this.setState({ showNewSessionOverlay: false });
  }

  handleCloseOverlay = () => {
    this.props.endSession();
    this.setState({ showNewSessionOverlay: false });
  }

  render() {
    const { error, protocols } = this.state;
    const { isProtocolLoaded, server } = this.props;

    if (this.state.showNewSessionOverlay && isProtocolLoaded) {
      return (
        <NewSessionOverlay
          handleSubmit={this.handleCreateSession}
          onClose={this.handleCloseOverlay}
          show={this.state.showNewSessionOverlay}
        />);
    } else if (isProtocolLoaded) {
      const pathname = `/session/${this.props.sessionId}/${this.props.protocolType}/${this.props.protocolPath}/0`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

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
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  endSession: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  openDialog: PropTypes.func.isRequired,
  pairedServer: PropTypes.object.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
  }).isRequired,
  sessionId: PropTypes.string.isRequired,
  unpairServer: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
    pairedServer: state.pairedServer,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    endSession: bindActionCreators(sessionActions.endSession, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };
