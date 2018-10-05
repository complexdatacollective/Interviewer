import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

import { Icon, Spinner } from '../../ui/components';
import ServerDiscoverer from '../../utils/serverDiscoverer';
import ServerCard from '../../components/Setup/ServerCard';

const loadingPlaceholder = (
  <div className="server-list__placeholder">
    <Spinner />
    <h4>Listening for nearby Servers...</h4>
  </div>
);

class ServerList extends Component {
  constructor() {
    super();

    this.state = {
      error: null,
      servers: [],
    };
  }
  componentDidMount() {
    this.initServer();
  }

  componentDidUpdate() {
    // Give some console output about the error, just for debugging.
    if (this.state.error) {
      // eslint-disable-next-line
      console.warn(this.state.error);
    }
  }

  componentWillUnmount() {
    this.serverDiscoverer.removeAllListeners();
  }

  bindServerEvents = () => {
    if (!this.serverDiscoverer) { return; }

    this.serverDiscoverer.on('SERVER_RESET', () => {
      this.setState({
        error: null,
      });
    });

    this.serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      if (!response.name) { return; }

      const servers = this.state.servers.slice();
      // Detect if we already have a service with this name
      const serverIndex = this.state.servers.findIndex(server => response.name === server.name);
      if (serverIndex === -1) {
        servers.push(response);
      } else {
        servers[serverIndex] = response;
      }
      this.setState(() => ({ servers }));
    });

    this.serverDiscoverer.on('SERVER_REMOVED', (response) => {
      this.setState(prevState => ({
        servers: prevState.servers.filter(item => (item.name !== response.name)),
      }));
    });

    this.serverDiscoverer.on('SERVER_ERROR', (error) => {
      this.setState({ error });
    });
  }

  initServer = () => {
    try {
      this.serverDiscoverer = new ServerDiscoverer();
      this.bindServerEvents();
      this.serverDiscoverer.init();
    } catch (error) {
      this.setState({ error });
    }
  }

  renderServerList() {
    const { pairedServers } = this.props;
    return (
      <div className="server-list__content">
        {
          this.state.servers.map((server) => {
            // Review: Single server may have two pairingServiceUrls;
            // should this be treated as two servers?
            const isPaired = pairedServers.some(s => (
              s.pairingServiceUrl === server.pairingServiceUrl));
            const onSelect = isPaired ? this.props.selectPairedServer : this.props.selectServer;
            return (
              <ServerCard
                key={server.pairingServiceUrl}
                data={server}
                selectServer={onSelect}
                secondaryLabel={isPaired ? '(paired)' : ''}
              />
            );
          })
        }
      </div>
    );
  }

  renderError() {
    return (
      <div className="server-list__placeholder">
        <Icon name="error" />
        <h4>Automatic server discovery unavailable</h4>
        { // eslint-disable-next-line no-alert
        }<p>{this.state.error}</p>
      </div>
    );
  }

  render() {
    const serversAvailable = !this.state.error && this.state.servers.length > 0;
    const className = classNames('server-list', { 'server-list--available': serversAvailable });

    if (this.state.error) {
      return (<div className={className}>{this.renderError()}</div>);
    }

    if (serversAvailable) {
      return (<div className={className}>{this.renderServerList()}</div>);
    }

    return (<div className={className}>{loadingPlaceholder}</div>);
  }
}

ServerList.defaultProps = {
  pairedServers: [],
  selectPairedServer: () => {},
  selectServer: () => {},
};

ServerList.propTypes = {
  pairedServers: PropTypes.array,
  selectPairedServer: PropTypes.func,
  selectServer: PropTypes.func,
};

const mapStateToProps = state => ({
  pairedServers: state.servers.paired,
});

export default connect(mapStateToProps)(ServerList);

export { ServerList as UnconnectedServerList };
