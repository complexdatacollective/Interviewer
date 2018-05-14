import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import ServerList from './ServerList';
import ServerPairing from './ServerPairing';
import ServerAddressForm from '../../components/Setup/ServerAddressForm';
import { Button, Icon } from '../../ui/components';

class ProtocolImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { selectedServer: null };
  }

  contentArea = () => {
    const { manualEntry, selectedServer } = this.state;
    let content;
    if (selectedServer && selectedServer.apiUrl) {
      content = <ServerPairing server={selectedServer} />;
    } else if (manualEntry) {
      content = (
        <ServerAddressForm
          selectServer={this.selectServer}
          cancel={() => this.setState({ manualEntry: false })}
        />
      );
    } else {
      content = <ServerList selectServer={this.selectServer} />;
    }
    return content;
  }

  selectServer = (server) => {
    this.setState({ selectedServer: server });
  }

  render() {
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
          {this.contentArea()}
        </div>
        <div className="protocol-import__buttons">
          {
            !this.state.manualEntry &&
            <Button
              size="small"
              color="platinum"
              content="Enter manually"
              onClick={() => this.setState({ manualEntry: true })}
            />
          }
        </div>
      </div>
    );
  }
}

export default ProtocolImport;
