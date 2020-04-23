import React, { PureComponent } from 'react';
import crypto from 'crypto';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { forEach, each } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import ProtocolUrlForm from './ProtocolUrlForm';
import ServerPairing from './ServerPairing';
import SessionExportStatusList from './SessionExportStatusList';
import { ServerAddressForm, DiscoveredServerList } from '../../components/Setup';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import Overlay from '../Overlay';
import { asExportableNetwork } from '../../utils/networkFormat';
import PairedServerWrapper from '../../components/Setup/PairedServerWrapper';
import saveFile from '../../utils/SaveFile';

/**
 * The remote protocol ID on any instance of Server is the hex-encoded sha256 of its [unique] name.
 * Server will need to know this ID when we export/import session data.
 */
const nameDigest = name => name && crypto.createHash('sha256').update(name).digest('hex');

class ExportSessionsOverlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedServer: null, // set when user selects/enters a server to pair with
      previousSelectedServer: null, // selectedServer clone to populate manual inputs
      exportMode: 'server', // used to switch between tabbed views
      deleteAfterExport: false, //  determines if successfully uploaded sessions should be removed.
      showExportProgress: false, // Weather to show the SessionExportStatusList
      exportFinished: false,
      showDownloadProgress: false,
      downloadFinished: false,
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

  get sessionsAreExportable() {
    const { pairedServer } = this.props;
    return pairedServer && pairedServer.secureServiceUrl;
  }

  get exportSection() {
    const successfullyExportedSession = () => {
      let foundSession = false;

      each(this.props.sessions, (value) => {
        if (value.exportStatus === 'finished') { foundSession = true; }
      });

      return foundSession;
    };

    const exportFunc = this.state.exportMode === 'server' ? this.export : this.exportToFile;
    const progress = this.state.exportMode === 'server' ? this.state.showExportProgress : this.state.showDownloadProgress;
    const finished = this.state.exportMode === 'server' ? this.state.exportFinished : this.state.downloadFinished;
    const errorMessage = this.state.exportMode === 'server' ? 'This session is not exportable: it is not associated with any Server.' : 'This session is not exportable.';

    if (this.sessionsAreExportable || this.state.exportMode === 'download') {
      if (progress) {
        return (
          <div className="session-export-content">
            <div className="session-export-content__container">
              <SessionExportStatusList
                sessionsToExport={this.props.sessionsToExport}
                deleteWhenFinished={this.state.deleteAfterExport}
              />
            </div>
            { finished &&
            <div className="session-export-content__footer">
              { !this.props.activeSession && successfullyExportedSession() &&
                <Toggle
                  input={{
                    value: this.state.deleteAfterExport,
                    onChange: () => {
                      this.setState({ deleteAfterExport: !this.state.deleteAfterExport });
                    },
                  }}
                  label="Delete sessions that successfully exported?"
                  fieldLabel=" "
                />
              }
              <div className="session-export-content__footer--actions">
                <Button
                  onClick={() => {
                    if (this.state.deleteAfterExport) {
                      forEach(this.props.sessionsToExport, (sessionId) => {
                        const session = this.props.sessions[sessionId];

                        if (session.exportStatus === 'finished') {
                          this.props.removeSession(sessionId);
                        }
                      });
                    }

                    this.props.onClose();
                  }}
                >
                  Finished
                </Button>
                <p>
                  Export finished. Review the output above before continuing.
                </p>
              </div>
            </div>
            }
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
                    Ensure this is the correct destination before continuing.
            </p>
          </div>
          <div className="session-export-content__footer">
            <div className="session-export-content__footer--actions">
              <Button onClick={() => exportFunc(this.props.sessionsToExport)}>
                Export
              </Button>
            </div>
          </div>
        </React.Fragment>);
      const serverWrapper = (
        <PairedServerWrapper className="server-setup__card" data={this.props.pairedServer} isPaired>
          {tabContent}
        </PairedServerWrapper>);
      return (
        <div className="session-export-content">
          <div className="session-export-content__container">
            {this.state.exportMode === 'server' ? serverWrapper : <div>{tabContent}</div>}
          </div>
        </div>
      );
    }

    return <p>{errorMessage}</p>;
  }

  export(sessionList) {
    this.setState({ showExportProgress: true, exportFinished: false });

    this.props.bulkExportSessions(sessionList.map((sessionId) => {
      const session = this.props.sessions[sessionId];
      const sessionProtocolUID = session.protocolUID;
      const sessionCodebook = this.props.installedProtocols[sessionProtocolUID].codebook;
      const sessionProtocolName = this.props.installedProtocols[sessionProtocolUID].name;
      const remoteProtocolId = nameDigest(sessionProtocolName);

      const sessionData = asExportableNetwork(
        session.network,
        sessionCodebook,
        { _caseID: session.caseId },
      );

      return { remoteProtocolId, sessionUUID: sessionId, sessionData };
    }))
      .then(() => { this.setState({ exportFinished: true }); });
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

  exportToFile = (exportedSessions) => {
    this.setState({ showDownloadProgress: true, downloadFinished: false });
    this.props.sessionExportStart(exportedSessions.map(sessionId => ({ sessionUUID: sessionId })));
    saveFile(
      exportedSessions,
      this.props.sessions,
      this.props.installedProtocols,
    )
      .then((result) => {
        if (result === 'cancelled') {
          this.setState({ showDownloadProgress: false });
          return this.props.sessionExportReset();
        }

        this.setState({ downloadFinished: true });
        return exportedSessions.map(sessionId => this.props.sessionExportSucceeded(sessionId));
      })
      .catch((err) => {
        exportedSessions.map(sessionId => this.props.sessionExportFailed(sessionId, err));
        return this.handleExportError(err);
      });
  };

  switchTab = (exportMode) => {
    if (exportMode === this.state.exportMode) return;

    this.setState({ exportMode, showDownloadProgress: false, showExportProgress: false });
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
  removeSession: PropTypes.func.isRequired,
  sessionsToExport: PropTypes.array.isRequired,
  openDialog: PropTypes.func.isRequired,
  bulkExportSessions: PropTypes.func.isRequired,
  sessionExportReset: PropTypes.func.isRequired,
  sessionExportStart: PropTypes.func.isRequired,
  sessionExportSucceeded: PropTypes.func.isRequired,
  sessionExportFailed: PropTypes.func.isRequired,
  activeSession: PropTypes.string,
  pairedServer: PropTypes.shape({
    pairingServiceUrl: PropTypes.string.isRequired,
    name: PropTypes.string,
  }),
};

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
  sessions: state.sessions,
  installedProtocols: state.installedProtocols,
  activeSession: state.activeSessionId,
});

const mapDispatchToProps = dispatch => ({
  bulkExportSessions: bindActionCreators(sessionsActions.bulkExportSessions, dispatch),
  sessionExportReset: bindActionCreators(sessionsActions.sessionExportReset, dispatch),
  sessionExportStart: bindActionCreators(sessionsActions.sessionExportStart, dispatch),
  sessionExportSucceeded: bindActionCreators(sessionsActions.sessionExportSucceeded, dispatch),
  sessionExportFailed: bindActionCreators(sessionsActions.sessionExportFailed, dispatch),
  removeSession: bindActionCreators(sessionsActions.removeSession, dispatch),
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportSessionsOverlay);
