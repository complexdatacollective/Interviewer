import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import ApiClient from '../../utils/ApiClient';
import { actionCreators as protocolActions } from '../../ducks/modules/protocol';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { ServerProtocolList, ServerSetup } from '../../components/Setup';
import { getPairedServerFactory } from '../../selectors/servers';

class ServerProtocols extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { server, getPairedServer } = this.props;
    const pairedServer = getPairedServer(server.apiUrl);
    this.apiClient = new ApiClient(server.apiUrl, pairedServer);
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
              downloadProtocol(p.downloadUrl);
            }}
          />
        }
      </ServerSetup>
    );
  }
}

ServerProtocols.defaultProps = {
  onError: () => {},
  getPairedServer: () => {},
  protocolPath: '',
};

ServerProtocols.propTypes = {
  addSession: PropTypes.func.isRequired,
  downloadProtocol: PropTypes.func.isRequired,
  downloadProtocolFailed: PropTypes.func.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  onError: PropTypes.func,
  getPairedServer: PropTypes.func,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  server: PropTypes.shape({
    apiUrl: PropTypes.string.isRequired,
  }).isRequired,
  sessionId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
    protocolType: state.protocol.type,
    sessionId: state.session,
    getPairedServer: getPairedServerFactory(state),
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
