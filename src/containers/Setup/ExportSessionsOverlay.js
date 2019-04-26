import React, { PureComponent } from 'react';
import crypto from 'crypto';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { forEach } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProtocolUrlForm from './ProtocolUrlForm';
import ServerPairing from './ServerPairing';
import SessionExportStatusList from './SessionExportStatusList';
import { ServerAddressForm, DiscoveredServerList } from '../../components/Setup';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import importLocalProtocol from '../../utils/protocol/importLocalProtocol';
import Overlay from '../Overlay';
import { Button } from '../../ui/components';
import { Toggle } from '../../ui/components/Fields';
import { asExportableNetwork } from '../../utils/networkFormat';
import PairedServerWrapper from '../../components/Setup/PairedServerWrapper';

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
      showExportProgress: false, // Weather to show the SessioNexportStatusList
      exportFinished: false,
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
    if (this.sessionsAreExportable) {
      if (this.state.showExportProgress) {
        // const exportErrors = pick(this.props.sessions, this.props.sessionsToExport);

        return (
          <div className="session-export-content">
            <div className="session-export-content__container">
              <SessionExportStatusList
                sessionsToExport={this.props.sessionsToExport}
                deleteWhenFinished={this.state.deleteAfterExport}
              />
            </div>
            { this.state.exportFinished &&
            <div className="session-export-content__footer">
              { !this.props.activeSession &&
                <Toggle
                  input={{
                    value: this.state.deleteAfterExport,
                    onChange: () => {
                      this.setState({ deleteAfterExport: !this.state.deleteAfterExport });
                    },
                  }}
                  label="Delete successfully exported sessions?"
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

                    this.setState({
                      showExportProgress: false,
                      exportFinished: false,
                      deleteAfterExport: false,
                    });
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
      return (
        <div className="session-export-content">
          <div className="session-export-content__container">
            <PairedServerWrapper className="server-setup__card" data={this.props.pairedServer} isPaired>
              <div>
                <h2>Ready to export</h2>
                <p>
                  Ready to export {this.props.sessionsToExport.length} session{this.props.sessionsToExport.length > 1 && ('s')} to {this.props.pairedServer.name}.
                  Ensure this is the correct destination before continuing.
                </p>

              </div>
              <div className="session-export-content__footer">
                <div className="session-export-content__footer--actions">
                  <Button onClick={() => this.export(this.props.sessionsToExport)}>
                    Export
                  </Button>
                </div>
              </div>
            </PairedServerWrapper>
          </div>
        </div>
      );
    }

    return <p>This session is not exportable: it is not associated with any Server.</p>;
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
    // If we are paired, show the server list.
    } else if (pairedServer) {
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
          onClick={() => this.setState({ exportMode: 'server' })}
        >
          To Server
        </div>
        <div
          className="tab"
          onClick={() => importLocalProtocol()}
        >
          To file
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
        title="Export interview data"
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
  removeSession: bindActionCreators(sessionsActions.removeSession, dispatch),
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportSessionsOverlay);
