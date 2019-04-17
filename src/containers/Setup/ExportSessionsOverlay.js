import React, { PureComponent } from 'react';
import crypto from 'crypto';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProtocolUrlForm from './ProtocolUrlForm';
import ServerPairing from './ServerPairing';
import { ServerAddressForm, DiscoveredServerList } from '../../components/Setup';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import importLocalProtocol from '../../utils/protocol/importLocalProtocol';
import Overlay from '../Overlay';
import { Button } from '../../ui/components';
import { asExportableNetwork } from '../../utils/networkFormat';

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
      return (
        <div>
          <p>
            You have some sessions to export.
            Export {this.props.sessionsToExport.length} session(s)?
          </p>
          <Button onClick={() => this.export(this.props.sessionsToExport)}>
            Export
          </Button>
        </div>
      );
    }

    return <p>This session is not exportable: it is not associated with any Server.</p>;
  }

  export(sessionList) {
    // sessionList.forEach((sessionUID, index) => {
    //   setTimeout(() => {
    //     this.exportSession(sessionUID);
    //   }, 2000 * index);
    // });

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
    })).then(() => { console.log('yayaya'); })
      .catch(error => console.log('error', error));
  }

  // exportSession(sessionId) {
  //   const session = this.props.sessions[sessionId];
  //   const sessionProtocolUID = session.protocolUID;
  //   const sessionCodebook = this.props.installedProtocols[sessionProtocolUID].codebook;
  //   const sessionProtocolName = this.props.installedProtocols[sessionProtocolUID].name;
  //   const remoteProtocolId = nameDigest(sessionProtocolName);

  //   console.log({ session, sessionProtocolUID, sessionCodebook, remoteProtocolId });

  //   const sessionData = asExportableNetwork(
  //     session.network,
  //     sessionCodebook,
  //     { _caseID: session.caseId },
  //   );
  //   console.log('exportSession', remoteProtocolId, sessionData);
  //   this.props.exportSession(remoteProtocolId, sessionId, sessionData);
  // }

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

ExportSessionsOverlay.defaultProps = {
  pairedServer: null,
};

ExportSessionsOverlay.propTypes = {
  pairedServer: PropTypes.object,
  show: PropTypes.bool.isRequired,
  sessions: PropTypes.object.isRequired,
  installedProtocols: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  sessionsToExport: PropTypes.array.isRequired,
  openDialog: PropTypes.func.isRequired,
  bulkExportSessions: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  pairedServer: state.pairedServer,
  sessions: state.sessions,
  installedProtocols: state.installedProtocols,
});

const mapDispatchToProps = dispatch => ({
  bulkExportSessions: bindActionCreators(sessionsActions.bulkExportSessions, dispatch),
  openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportSessionsOverlay);
