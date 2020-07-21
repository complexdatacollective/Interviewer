import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import ProtocolUrlForm from './ProtocolUrlForm';
import ServerPairing from './ServerPairing';
import { ServerAddressForm, DiscoveredServerList } from '../../components/Setup';
import { actionCreators as exportActions } from '../../ducks/modules/exportProcess';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import Overlay from '../Overlay';
import { asNetworkWithSessionVariables } from '../../utils/networkFormat';
import PairedServerWrapper from '../../components/Setup/PairedServerWrapper';
import ExportProgressOverlay from './ExportProgressOverlay';

/**
 * The remote protocol ID on any instance of Server is the hex-encoded sha256 of its [unique] name.
 * Server will need to know this ID when we export/import session data.
 */


class ExportSessionsOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedServer: null, // set when user selects/enters a server to pair with
      previousSelectedServer: null, // selectedServer clone to populate manual inputs
      exportMode: 'server', // used to switch between tabbed views
    };

    this.abortController = null;
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

  get sessionsAreExportable() {
    const { pairedServer } = this.props;
    return pairedServer && pairedServer.secureServiceUrl;
  }

  get exportSection() {
    const exportFunc = this.state.exportMode === 'server' ? this.exportToServer : this.exportToFile;

    if (this.props.exportInProgress) {
      return (
        <div className="session-export-content">
          <ExportProgressOverlay
            abort={this.abortController}
          />
        </div>
      );
    }

    const destination = this.state.exportMode === 'server' ? this.props.pairedServer.name : 'file';
    const tabContent = (
      <React.Fragment>
        <div>
          <h2>Ready to export</h2>
          <p>
            Ready to export {this.props.sessionsToExport.length} session{this.props.sessionsToExport.length > 1 && ('s')} to {destination}.
          </p>
        </div>
        <div className="file-export__footer">
          <div className="file-export__footer--actions">
            <Button onClick={() => exportFunc(this.props.sessionsToExport)}>
              Export
            </Button>
          </div>
        </div>
      </React.Fragment>
    );

    return (
      <div className="session-export-content">
        {this.state.exportMode === 'server' ? (
          <PairedServerWrapper className="server-setup__card" data={this.props.pairedServer} isPaired>
            {tabContent}
          </PairedServerWrapper>
        ) : (
          <div className="file-export">{tabContent}</div>
        )}
      </div>
    );
  }
  pairWithServer = (server) => {
    this.setState({ selectedServer: server });
  }

  handleExportError = (additionalInformation) => {
    const error = new Error(additionalInformation);
    error.friendlyMessage = 'There was a problem downloading your data.';

    this.props.openDialog({
      type: 'Error',
      error,
      confirmLabel: 'Okay',
    });
  }

  exportToServer = (sessionList) => {
    const exportPromise = this.props.exportToServer(sessionList.map((sessionId) => {
      const session = this.props.sessions[sessionId];
      const sessionProtocolUID = session.protocolUID;
      const sessionProtocol = this.props.installedProtocols[sessionProtocolUID];

      return asNetworkWithSessionVariables(
        sessionId,
        session,
        sessionProtocol,
      );
    }));

    this.abortController = exportPromise.abort;
  }


  exportToFile = (exportedSessions) => {
    const exportPromise = this.props.exportToFile(exportedSessions.map((session) => {
      const sessionProtocol =
        this.props.installedProtocols[this.props.sessions[session].protocolUID];

      return asNetworkWithSessionVariables(
        session,
        this.props.sessions[session],
        sessionProtocol,
      );
    }));

    this.abortController = exportPromise.abort;
    // exportPromise.catch(error => console.log('caught here', error));
  };

  switchTab = (exportMode) => {
    if (exportMode === this.state.exportMode) return;

    this.setState({ exportMode });
    this.props.sessionExportReset();
  }

  contentAreas() {
    const {
      manualEntry,
      previousSelectedServer: prev,
      selectedServer,
      exportMode,
    } = this.state;

    const {
      pairedServer,
    } = this.props;

    let content;

    if (exportMode === 'url') {
      content = (
        <ProtocolUrlForm />
      );
    // If we are paired, show the server list, or exporting to file, show the session list
    } else if (exportMode === 'download' || pairedServer) {
      content = this.exportSection;

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
          <div className="session-export--footer">
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
      <div className="session-export-overlay__tabs">
        <div
          className={cx('tab', { 'tab--selected': this.state.exportMode === 'server' })}
          onClick={() => this.switchTab('server')}
        >
          Upload to Server
        </div>
        <div
          className={cx('tab', { 'tab--selected': this.state.exportMode === 'download' })}
          onClick={() => this.switchTab('download')}
        >
          Export to File
        </div>
      </div>
    );

    return { tabContent, mainContent: content };
  }

  render() {
    const { tabContent, mainContent } = this.contentAreas();
    return (
      <React.Fragment>
        <Overlay
          show={this.props.show}
          title="Upload or Export Interview Data"
          classNames="session-export-overlay"
          onClose={this.props.onClose}
          forceDisableFullScreen
        >
          {tabContent}
          <div className="session-export__content">
            {mainContent}
          </div>
        </Overlay>
      </React.Fragment>
    );
  }
}

ExportSessionsOverlay.defaultProps = {
  pairedServer: null,
  activeSession: null,
};

ExportSessionsOverlay.propTypes = {
  show: PropTypes.bool.isRequired,
  sessions: PropTypes.object.isRequired,
  installedProtocols: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  sessionsToExport: PropTypes.array.isRequired,
  openDialog: PropTypes.func.isRequired,
  exportToServer: PropTypes.func.isRequired,
  exportToFile: PropTypes.func.isRequired,
  sessionExportReset: PropTypes.func.isRequired,
  pairedServer: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
  exportInProgress: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
  sessions: state.sessions,
  installedProtocols: state.installedProtocols,
  activeSession: state.activeSessionId,
  exportInProgress: state.exportProcess.progress > 0,
});

const mapDispatchToProps = dispatch => ({
  exportToServer: bindActionCreators(exportActions.exportToServer, dispatch),
  exportToFile: bindActionCreators(exportActions.exportToFile, dispatch),
  sessionExportReset: bindActionCreators(exportActions.sessionExportFinish, dispatch),
  removeSession: bindActionCreators(sessionsActions.removeSession, dispatch),
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportSessionsOverlay);
