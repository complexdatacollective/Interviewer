import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ApiClient from '../../utils/ApiClient';
import Dialog from '../Dialog';
import { actionCreators as modalActions } from '../../ducks/modules/modals';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as serverActions } from '../../ducks/modules/pairedServer';
import { ServerProtocolList, ServerSetup, ServerUnavailable } from '../../components/Setup';

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
    const { addSession, downloadProtocol } = this.props;
    addSession();
    this.apiClient.addTrustedCert()
      .then(() => downloadProtocol(protocol.downloadPath, true));
  }

  render() {
    const { error, protocols } = this.state;
    const { isProtocolLoaded, openModal, server } = this.props;

    if (isProtocolLoaded) {
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
        <ServerSetup server={server} handleUnpair={() => openModal('CONFIRM_UNPAIR_SERVER')}>
          {content}
        </ServerSetup>
        <Dialog
          name="CONFIRM_UNPAIR_SERVER"
          title="Unpair this Server?"
          type="warning"
          confirmLabel="Unpair Server"
          onConfirm={this.props.unpairServer}
        >
          <p>
            This will remove this Server from the app.
            You will have to re-pair to import protocols or export data.
            Are you sure you want to continue?
          </p>
        </Dialog>
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
  isProtocolLoaded: PropTypes.bool.isRequired,
  openModal: PropTypes.func.isRequired,
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
    openModal: bindActionCreators(modalActions.openModal, dispatch),
    unpairServer: bindActionCreators(serverActions.unpairServer, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };
