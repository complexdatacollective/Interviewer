/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react';
import ServerDiscoverer from '../utils/serverDiscoverer';
import { isElectron, isCordova } from '../utils/Environment';


const normalizeServerItem = (serverItem) => {
  const { name, interfaceIndex, host, port, addresses } = serverItem;
  return { name, interfaceIndex, host, port, addresses };
};

class ServerList extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  componentDidCatch() {
    this.setState({ hasError: true });
  }
  render() {
    if (this.state.hasError) {
      return <h1>Automatic server discovery unavailable.</h1>;
    }
    return <ServerListBrowser />;
  }
}

class ServerListBrowser extends Component {
  constructor() {
    super();

    this.state = {
      servers: [],
    };

    this.serverDiscoverer = new ServerDiscoverer();

    if (!isElectron() && !isCordova()) { throw new Error('Automatic server discovery is not supported in the browser.'); }
  }

  componentWillMount() {
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
      throw new Error(error);
    });
  }

  componentDidMount() {
    this.serverDiscoverer.init();
  }

  render() {
    return (
      <div className="ServerListBrowser">

        <div className="ServerListBrowser__heading">
          <h3 className="ServerListBrowser__heading-header">Available Servers:</h3>
        </div>
        <div className="ServerListBrowser__content" >
          {this.state.servers.length > 0 ?
            this.state.servers.map(server => (<button>{server.name}</button>)) :
            (<h4>No Servers currently available.</h4>)
          }
        </div>
      </div>
    );
  }
}

export default ServerList;
