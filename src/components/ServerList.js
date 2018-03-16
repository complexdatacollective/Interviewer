import React, { Component } from 'react';
import { Button, Icon, Spinner } from 'network-canvas-ui';
import ServerDiscoverer from '../utils/serverDiscoverer';
import ServerCard from '../components/ServerCard';

class ServerList extends Component {
  constructor() {
    super();

    this.state = {
      error: null,
      servers: [],
    };

    try {
      this.serverDiscoverer = new ServerDiscoverer();
    } catch (error) {
      this.state.error = error;
    }
  }
  componentDidMount() {
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);

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
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    this.unbindServerEvents();
  }

  bindServerEvents = () => {
    this.serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      this.setState(prevState => ({
        servers: [...prevState.servers, response],
      }));
    });

    this.serverDiscoverer.on('SERVER_REMOVED', (response) => {
      const position = this.state.servers.findIndex(server => server.name === response.name);
      this.setState(prevState => ({
        servers: prevState.servers.splice(position, 1),
      }));
    });

    this.serverDiscoverer.on('SERVER_ERROR', (error) => {
      this.setState({ error });
    });
  }

  handleNetworkChange = () => {
    if (navigator.onLine) {
      this.initServer();
    } else {
      this.unbindServerEvents();
      this.setState({ error: new Error('The Server Discovery service requires a network connection.') });
    }
  }

  stopServer = () => {
    this.setState({ servers: [] }, () => {
      this.serverDiscoverer.removerAllListeners();
    });
  }

  initServer = () => {
    this.setState({ servers: [], error: null }, () => {
      this.bindServerEvents();
      this.serverDiscoverer.init();
    });
  }

  renderServerList() {
    if (this.state.servers.length > 0) {
      return (
        this.state.servers.map(server => (<ServerCard data={server}>{server.name}</ServerCard>))
      );
    }

    return ([<Spinner />, <h4>Listening for nearby Servers...</h4>]);
  }

  render() {
    return (
      <div className="server-list">
        <div className="server-list__content">
          <div className="server-list__placeholder">
            {this.state.error ?
              ([
                <Icon name="error" />,
                <h4>Automatic server discovery unavailable</h4>,
                // eslint-disable-next-line no-alert
                <Button small onClick={() => alert(this.state.error.message)}>why?</Button>,
              ])
              :
              this.renderServerList()
            }
          </div>
        </div>
      </div>
    );
  }
}

export default ServerList;
