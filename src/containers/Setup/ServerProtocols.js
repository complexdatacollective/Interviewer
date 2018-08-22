import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ApiClient from '../../utils/ApiClient';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { ServerProtocolList, ServerSetup } from '../../components/Setup';
import { getPairedServer } from '../../selectors/servers';

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
    this.props.downloadProtocolFailed(err); // Show message to user
    this.setState({});
    this.props.onError(err); // Signal parent
  }

  fetchProtocolList = () => {
    this.apiClient
      .addTrustedCert()
      .then(() => this.apiClient.getProtocols())
      .then(protocols => this.setState({ protocols }))
      .catch(err => this.handleApiError(err));
  }

  render() {
    if (this.props.isProtocolLoaded) {
      const pathname = `/session/${this.props.sessionId}/${this.props.protocolType}/${this.props.protocolPath}/0`;
      return (<Redirect to={{ pathname: `${pathname}` }} />);
    }

    const { protocols } = this.state;
    const { addSession, server, downloadProtocol } = this.props;

    return (
      <ServerSetup server={server}>
        {
          protocols &&
          <ServerProtocolList
            protocols={protocols}
            selectProtocol={(p) => {
              addSession();
              this.apiClient.addTrustedCert()
                .then(() => downloadProtocol(p.downloadUrl, true));
            }}
          />
        }
      </ServerSetup>
    );
  }
}

ServerProtocols.defaultProps = {
  onError: () => {},
  protocolPath: '',
};

ServerProtocols.propTypes = {
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  downloadProtocolFailed: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  onError: PropTypes.func,
  pairedServer: PropTypes.object.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  server: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
  }).isRequired,
  sessionId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
    pairedServer: getPairedServer(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    downloadProtocol: bindActionCreators(protocolActions.downloadProtocol, dispatch),
    downloadProtocolFailed: bindActionCreators(protocolActions.downloadProtocolFailed, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerProtocols);

export { ServerProtocols as UnconnectedServerProtocols };
