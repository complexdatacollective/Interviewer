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
    if (!this.serverDiscoverer) { return; }

    this.serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      this.setState(prevState => ({
        servers: [...prevState.servers, response],
      }));
    });

    this.serverDiscoverer.on('SERVER_REMOVED', (response) => {
      console.log('Looking for:');
      console.log(response);

      this.setState(prevState => ({
        // eslint-disable-next-line
        servers: prevState.servers.filter(item => !(item.name == response.name && item.index == response.index)),
      }), () => {
        console.log('updated state.');
        console.log(this.state.servers);
      });
    });

    this.serverDiscoverer.on('SERVER_ERROR', (error) => {
      this.setState({ error });
    });
  }

  handleNetworkChange = () => {
    if (navigator.onLine) {
      this.initServer();
    } else {
      this.stopServer();
    }
  }

  stopServer = () => {
    this.setState({ servers: [] }, () => {
      this.serverDiscoverer.removerAllListeners();
    });
  }

  initServer = () => {
    try {
      this.serverDiscoverer = new ServerDiscoverer();
      this.setState({ servers: [], error: null }, () => {
        this.bindServerEvents();
        this.serverDiscoverer.init();
      });
    } catch (error) {
      this.setState({ error });
    }
  }

  renderServerList() {
    if (this.state.servers.length > 0) {
      return (
        this.state.servers.map(server => (<ServerCard data={server}>{server.name}</ServerCard>))
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
                }<Button small onClick={() => alert(this.state.error.message)}>why?</Button>
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

export default ServerList;
