import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import ServerList from './ServerList';
import ServerPairing from './ServerPairing';
import { Icon } from '../../ui/components';

class ProtocolImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { selectedServer: null };
  }

  selectServer = (server) => {
    this.setState({ selectedServer: server });
  }

  render() {
    const { selectedServer } = this.state;
    return (
      <div className="protocol-import">
        <Link to="/" className="protocol-import__close">
          <Icon name="close" />
        </Link>
        <h1>Fetch a protocol from Server</h1>
        <p>
          To use this feature, open Server on a computer connected to the same network as
          this device.
        </p>
        <p>For information about using this feature, see our documentation.</p>
        <div className="protocol-import__content">
          {
            !selectedServer && <ServerList selectServer={this.selectServer} />
          }
          {
            selectedServer && <ServerPairing server={selectedServer} />
          }
        </div>
      </div>
    );
  }
}

export default ProtocolImport;
