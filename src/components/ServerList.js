import React, { Component } from 'react';
import ServerDiscoverer from '../utils/serverDiscoverer';
import { isElectron, isCordova } from '../utils/Environment';


const normalizeServerItem = (serverItem) => {
  const { name, interfaceIndex, host, port, addresses } = serverItem;
  return { name, interfaceIndex, host, port, addresses };
};

class ServerList extends Component {
  constructor() {
    super();

    this.state = {
      error: null,
      servers: [],
    };

    this.serverDiscoverer = new ServerDiscoverer();
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
  }

  componentWillMount() {
    if (!isElectron() && !isCordova()) {
      this.setState({ error: new Error('Automatic server discovery is not supported in the browser.') });
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);

    this.serverDiscoverer.on('SERVER_ANNOUNCED', (response) => {
      this.setState(prevState => ({
        servers: [...prevState.servers, normalizeServerItem(response)],
      }));
    });

    this.serverDiscoverer.on('SERVER_REMOVED', (response) => {
      const position = this.state.servers.findIndex(server => server.name === response.name);
      this.setState(prevState => ({
        servers: [...prevState.servers.slice(0, position), ...prevState.servers.slice(position + 1)], // eslint-disable-line
      }));
    });

    this.serverDiscoverer.on('SERVER_ERROR', (error) => {
      this.setState({ error });
    });

    this.serverDiscoverer.start();
  }

  componentDidUpdate() {
    if (this.state.error) {
      console.warn(this.state.error);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    this.serverDiscoverer.off();
  }

  handleNetworkChange() {
    if (navigator.onLine) {
      this.setState({ servers: [], error: null }, () => {
        this.serverDiscoverer.start();
      });
    } else {
      this.setState({ error: new Error('The Server Discovery service requires a network connection.') });
    }
  }

  render() {
    return (
      <div className="ServerListBrowser">

        <div className="ServerListBrowser__heading">
          <h2 className="ServerListBrowser__heading-header">Available Servers:</h2>
        </div>
        {this.state.error ?
          (<div>
            <h4>Automatic server discovery unavailable.</h4>
            <p><strong>Reason:</strong> {this.state.error.message}</p>
          </div>)
          :
          (<div className="ServerListBrowser__content">
            {this.state.servers.length > 0 ?
              // eslint-disable-next-line
              this.state.servers.map(server => (<button onClick={() => console.log(server)}>{server.name}</button>)) :
              (<h4>No nearby Servers found.</h4>)
            }
          </div>)
        }
      </div>
    );
  }
}

export default ServerList;
