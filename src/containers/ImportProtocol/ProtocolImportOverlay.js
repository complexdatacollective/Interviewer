import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@codaco/ui';
import ProtocolUrlForm from './ProtocolUrlForm';
import ServerPairing from '../ServerPairing/ServerPairing';
import ServerProtocols from '../ServerPairing/ServerProtocols';
import { ServerAddressForm, DiscoveredServerList } from '../../components/SetupScreen';
import importLocalProtocol from '../../utils/protocol/importLocalProtocol';
import { actionCreators as protocolActions } from '../../ducks/modules/importProtocol';
import Overlay from '../Overlay';

/**
 * This component is the top-level interface for protocol importing, wrapping
 * dependent tasks such as server discovery and pairing.
 *
 * - A user selects (or manually enters the connection info of) an available server.
 * - If pairing is required, then the pairing form is shown.
 * - If or once a server is paired, a selectable list of protocols is shown.
 */
class ProtocolImportOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedServer: null, // set when user selects/enters a server to pair with
      previousSelectedServer: null, // selectedServer clone to populate manual inputs
      importMode: 'server', // used to switch between tabbed views
    };
  }

  onPairingError() {
    this.setState({
      // Make prev data available to repopulate manual form if needed
      previousSelectedServer: this.state.selectedServer,
      selectedServer: null,
    });
  }

  onPairingComplete = () => {
    this.setState({
      previousSelectedServer: null,
      selectedServer: null,
    });
  }

  onImportProtocol = (url, usePairedServer) => {
    this.props.importProtocolFromURI(url, usePairedServer);
    this.props.onClose();
  }

  pairWithServer = (server) => {
    this.setState({ selectedServer: server });
  }

  contentAreas() {
    const {
      manualEntry,
      previousSelectedServer: prev,
      selectedServer,
      importMode,
    } = this.state;

    const {
      pairedServer,
    } = this.props;

    let content;

    // Show the URL form
    if (importMode === 'url') {
      content = (
        <ProtocolUrlForm importProtocolFromURI={this.onImportProtocol} />
      );

    // If we are paired, show the server list.
    } else if (pairedServer) {
      content =
        <ServerProtocols server={pairedServer} importProtocolFromURI={this.onImportProtocol} />;

    // If user has requested manual entry show the form
    } else if (manualEntry) {
      content = (
        <ServerAddressForm
          address={prev && prev.addresses && prev.addresses[0]}
          port={prev && prev.port}
          selectServer={this.pairWithServer}
          onCancel={() => this.setState({ manualEntry: false })}
        />
      );
    // If we have selected a server or have entered server connection details, attempt pairing
    } else if (selectedServer && selectedServer.pairingServiceUrl) {
      content = (
        <React.Fragment>
          <ServerPairing
            server={selectedServer}
            onComplete={this.onPairingComplete}
            onError={() => this.onPairingError()}
            onCancel={() => this.setState({ selectedServer: null })}
          />
        </React.Fragment>
      );
    // Otherwise, we are on the server tab and should show the discovery view
    } else {
      content = (
        <React.Fragment>
          <DiscoveredServerList selectServer={this.pairWithServer} />
          <div className="protocol-import--footer">
            <Button
              color="platinum"
              content="Enter manual connection details"
              onClick={() => this.setState({ manualEntry: true })}
            />
          </div>
        </React.Fragment>
      );
    }

    // Renders the tabs for switching views
    const tabContent = (
      <div className="protocol-import-dialog__tabs">
        <div
          className={cx('tab', { 'tab--selected': this.state.importMode === 'server' })}
          onClick={() => this.setState({ importMode: 'server' })}
        >
          From Server
        </div>
        <div
          className={cx('tab', { 'tab--selected': this.state.importMode === 'url' })}
          onClick={() => this.setState({ importMode: 'url' })}
        >
          From URL
        </div>
        <div
          className="tab"
          onClick={() => importLocalProtocol()}
        >
          Local file
        </div>
      </div>
    );

    return { tabContent, mainContent: content };
  }

  render() {
    const { tabContent, mainContent } = this.contentAreas();
    return (
      <Overlay
        show={this.props.show}
        title="Import a protocol"
        classNames="protocol-import-dialog"
        onClose={this.props.onClose}
        forceDisableFullScreen
      >
        {tabContent}
        <div className="protocol-import__content">
          {mainContent}
        </div>
      </Overlay>
    );
  }
}

ProtocolImportOverlay.defaultProps = {
  pairedServer: null,
};

ProtocolImportOverlay.propTypes = {
  pairedServer: PropTypes.object,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  importProtocolFromURI: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
});

function mapDispatchToProps(dispatch) {
  return {
    importProtocolFromURI:
      bindActionCreators(protocolActions.importProtocolFromURI, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolImportOverlay);

export {
  ProtocolImportOverlay as UnconnectedProtocolImportOverlay,
};
