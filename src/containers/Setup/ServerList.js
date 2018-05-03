import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Icon, Spinner } from '../../ui/components';
import ServerDiscoverer from '../../utils/serverDiscoverer';
import { ServerCard } from '../../components/Setup';

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
    if (this.state.servers.length > 0) {
      return (
        <div>
          {this.state.servers.map(server => (
            <ServerCard data={server} selectServer={this.props.selectServer}>
              {server.name}
            </ServerCard>
          ))}
        </div>
      );
    }

    return (<div className="server-list__placeholder"><Spinner /><h4>Listening for nearby Servers...</h4></div>);
  }

  render() {
    return (
      <div className="server-list">
        <div className="server-list__content">
          {this.state.error ?
            (
              <div className="server-list__placeholder">
                <Icon name="error" />
                <h4>Automatic server discovery unavailable</h4>
                { // eslint-disable-next-line no-alert
                }<Button size="small" onClick={() => alert(this.state.error)}>why?</Button>
              </div>
            )
            :
            this.renderServerList()
          }
        </div>
      </div>
    );
  }
}

ServerList.defaultProps = {
  selectServer: () => {},
};

ServerList.propTypes = {
  selectServer: PropTypes.func,
};

export default ServerList;
