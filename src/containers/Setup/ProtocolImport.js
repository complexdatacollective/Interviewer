import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import ProtocolUrlForm from './ProtocolUrlForm';
import ServerList from './ServerList';
import ServerPairing from './ServerPairing';
import ServerProtocols from './ServerProtocols';
import ServerAddressForm from '../../components/Setup/ServerAddressForm';
import { Button, Icon } from '../../ui/components';

/**
 * This component is the top-level interface for protocol importing, wrapping
 * dependent tasks such as server discovery and pairing.
 *
 * - A user selects (or manually enters the connection info of) an available server.
 * - If pairing is required, then the pairing form is shown.
 * - If or once a server is paired, a selectable list of protocols is shown.
 */
class ProtocolImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedServer: null, // set when user selects/enters a server to pair with
      previousSelectedServer: null, // selectedServer clone to populate manual inputs
      pairedServer: null, // set once pairing complete
    };
  }

  onPairingError() {
    this.setState({
      // Make prev data available to repopulate manual form if needed
      previousSelectedServer: this.state.selectedServer,
      selectedServer: null,
    });
  }

  setPairedServer = (server) => {
    this.setState({
      pairedServer: server,
      previousSelectedServer: null,
      selectedServer: null,
    });
  }

  pairWithServer = (server) => {
    this.setState({ selectedServer: server });
  }

  contentAreas() {
    const {
      manualEntry,
      pairedServer,
      previousSelectedServer: prev,
      selectedServer,
      showUrlForm,
    } = this.state;
    let content;
    let buttonContent = null;
    if (pairedServer) {
      content = <ServerProtocols server={pairedServer} />;
    } else if (selectedServer && selectedServer.pairingServiceUrl) {
      content = (
        <ServerPairing
          server={selectedServer}
          onComplete={() => this.setPairedServer(selectedServer)}
          onError={() => this.onPairingError()}
        />
      );
    } else if (manualEntry) {
      content = (
        <ServerAddressForm
          address={prev && prev.addresses && prev.addresses[0]}
          port={prev && prev.port}
          selectServer={this.pairWithServer}
          cancel={() => this.setState({ manualEntry: false })}
        />
      );
    } else if (showUrlForm) {
      content = (
        <ProtocolUrlForm
          onCancel={() => this.setState({ showUrlForm: false })}
        />
      );
    } else {
      content = (
        <ServerList
          selectPairedServer={this.setPairedServer}
          selectServer={this.pairWithServer}
        />
      );
      buttonContent = (
        <React.Fragment>
          <Button
            size="small"
            color="platinum"
            content="Import from URL"
            onClick={() => this.setState({ showUrlForm: true })}
          />
          <Button
            size="small"
            color="platinum"
            content="Enter manually"
            onClick={() => this.setState({ manualEntry: true })}
          />
        </React.Fragment>
      );
    }
    return { buttonContent, mainContent: content };
  }

  render() {
    const { mainContent, buttonContent } = this.contentAreas();
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
          {mainContent}
        </div>
        <div className="protocol-import__buttons">
          {buttonContent}
        </div>
      </div>
    );
  }
}

export default ProtocolImport;
