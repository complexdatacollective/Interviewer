import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import createGraphML from '../../utils/ExportData';
import { Button } from '../../ui/components';
import { Toggle } from '../../ui/components/Fields';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { getNetwork } from '../../selectors/network';
import { getActiveSession } from '../../selectors/session';
import { getProtocolCodebook, getRemoteProtocolId } from '../../selectors/protocol';
import { asExportableNetwork } from '../../utils/networkFormat';
import { ExportSessionsOverlay } from '../Setup';

const ExportSection = ({ defaultServer, children }) => (
  <div className="finish-session-interface__section finish-session-interface__section--export">
    <div>
      <h2>Data Export</h2>
      <p>
        Export this interview to {defaultServer.name} <br />
        <small>{defaultServer.secureServiceUrl}</small>
      </p>
    </div>
    <div className="finish-session-interface__section--buttons">
      { children }
    </div>
  </div>
);

class FinishSession extends Component {
  constructor() {
    super();
    this.state = {
      downloadDataAdditionalInfo: '',
      showExportSessionOverlay: false,
    };
  }

  get exportSection() {
    const { defaultServer } = this.props;

    if (this.currentSessionisExportable) {
      return (
        <ExportSection defaultServer={defaultServer}>
          <Button onClick={() => this.setState({ showExportSessionOverlay: true })}>
            Export
          </Button>
        </ExportSection>
      );
    } else if (this.currentSessionBelongsToProtocol) {
      // This is a rare case...
      return <p>This session is not exportable: there is no paired Server.</p>;
    }

    return <p>This session is not exportable: it is not associated with any Server.</p>;
  }

  get exportUrl() {
    const { defaultServer } = this.props;
    return defaultServer && defaultServer.secureServiceUrl;
  }

  get currentSessionBelongsToProtocol() {
    return !!this.props.remoteProtocolId;
  }

  get currentSessionisExportable() {
    return this.currentSessionBelongsToProtocol && this.exportUrl;
  }

  export(currentSession) {
    const { remoteProtocolId, sessionId, codebook } = this.props;
    const sessionData = asExportableNetwork(
      currentSession.network,
      codebook,
      { _caseID: currentSession.caseId },
    );
    this.props.bulkExportSessions([{ remoteProtocolId, sessionUUID: sessionId, sessionData }]);
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

  render() {
    return (
      <div className="interface finish-session-interface">
        <ExportSessionsOverlay
          show={this.state.showExportSessionOverlay}
          key={this.props.currentSession}
          onClose={() => {
            this.setState({
              showExportSessionOverlay: false,
            });
            this.props.resetSessionExport();
          }}
          sessionsToExport={[this.props.sessionId]}
        />
        <div className="finish-session-interface__frame">
          <h1 className="finish-session-interface__title type--title-1">
            Finish Interview
          </h1>
          <div className="finish-session-interface__section finish-session-interface__section--instructions">
            <p>
              You have reached the end of the interview.
              If you are satisfied with the information you have entered, you may finish the
              interview now.
            </p>
          </div>

          { this.exportSection }

          <div className="finish-session-interface__section finish-session-interface__section--download">
            <div>
              <h2>Data Download</h2>
              <p>Download network as a <code>.graphml</code> file</p>
            </div>
            <div>
              <Button
                color="platinum"
                onClick={() => createGraphML(this.props.currentNetwork,
                  this.props.codebook, this.handleExportError)
                }
              >
                Download
              </Button>
            </div>
          </div>
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
          <div className="finish-session-interface__section finish-session-interface__section--buttons">
            <Button onClick={this.props.endSession}>
              Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

FinishSession.propTypes = {
  currentNetwork: PropTypes.object.isRequired,
  currentSession: PropTypes.object.isRequired,
  defaultServer: PropTypes.object,
  endSession: PropTypes.func.isRequired,
  resetSessionExport: PropTypes.func.isRequired,
  bulkExportSessions: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
  remoteProtocolId: PropTypes.string,
  sessionId: PropTypes.string.isRequired,
  codebook: PropTypes.object,
};

FinishSession.defaultProps = {
  defaultServer: null,
  codebook: {},
  remoteProtocolId: null,
};

ExportSection.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]).isRequired,
  defaultServer: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    currentNetwork: getNetwork(state),
    currentSession: getActiveSession(state),
    remoteProtocolId: getRemoteProtocolId(state),
    sessionId: state.activeSessionId,
    defaultServer: state.pairedServer,
    codebook: getProtocolCodebook(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    bulkExportSessions: bindActionCreators(sessionsActions.bulkExportSessions, dispatch),
    resetSessionExport: bindActionCreators(sessionsActions.sessionExportReset, dispatch),
    endSession: () => {
      dispatch(sessionActions.endSession());
      dispatch(push('/'));
    },
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FinishSession);

export { FinishSession as UnconnectedFinishSession };
