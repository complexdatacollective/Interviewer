import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import ServerList from './ServerList';
import ServerPairing from './ServerPairing';
import ServerAddressForm from '../../components/Setup/ServerAddressForm';
import { Button, Icon } from '../../ui/components';

class ProtocolImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { previousSelectedServer: null, selectedServer: null };
  }

  onPairingError() {
    this.setState({
      // Make prev data available to repopulate manual form if needed
      previousSelectedServer: this.state.selectedServer,
      selectedServer: null,
    });
  }

  contentArea = () => {
    const { manualEntry, previousSelectedServer: prev, selectedServer } = this.state;
    let content;
    if (selectedServer && selectedServer.apiUrl) {
      content = (
        <ServerPairing
          server={selectedServer}
          onError={() => this.onPairingError()}
        />
      );
    } else if (manualEntry) {
      content = (
        <ServerAddressForm
          address={prev && prev.addresses && prev.addresses[0]}
          port={prev && prev.port}
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
    const { manualEntry, selectedServer } = this.state;
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
            !manualEntry &&
            !(selectedServer && selectedServer.apiUrl) &&
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
