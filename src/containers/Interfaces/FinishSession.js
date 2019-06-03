import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
      <h2>Data Upload</h2>
      { defaultServer ?
        (<p>
          Upload this interview to {defaultServer.name} <br />
          <small>{defaultServer.secureServiceUrl}</small>
        </p>) :
        (<p>
          Click upload to pair with a computer running Server, and transfer this interview.
        </p>)
      }
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
    return (
      <ExportSection defaultServer={defaultServer}>
        <Button onClick={() => this.setState({ showExportSessionOverlay: true })}>
          Upload
        </Button>
      </ExportSection>
    );
  }

  get exportUrl() {
    const { defaultServer } = this.props;
    return defaultServer && defaultServer.secureServiceUrl;
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

  handleFinishSession = () => {
    if (this.state.deleteAfterExport) {
      this.props.openDialog({
        type: 'Warning',
        title: 'Finish and delete?',
        confirmLabel: 'Finish and delete',
        onConfirm: () => this.props.endSession(this.state.deleteAfterExport),
        message: (
          <React.Fragment>
            <p>
              You have the &quot;Delete this session after finishing&quot; option enabled.
              Continuing will delete this interview session, regardless of if you have uploaded or
              exported it.
            </p>
            <p>Are you sure you want to continue?</p>
          </React.Fragment>
        ),
      });
    } else {
      this.props.endSession(this.state.deleteAfterExport);
    }
  };

  render() {
    return (
      <div className="interface finish-session-interface">
        <ExportSessionsOverlay
          show={this.state.showExportSessionOverlay}
          key={this.state.showExportSessionOverlay}
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
              <h2>Data Export</h2>
              <p>Export this network as a <code>.graphml</code> file</p>
            </div>
            <div>
              <Button
                color="platinum"
                onClick={() => createGraphML(this.props.currentNetwork,
                  this.props.codebook, this.handleExportError)
                }
              >
                Export
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
            label="Delete this session after finishing?"
            fieldLabel=" "
          />
          <div className="finish-session-interface__section finish-session-interface__section--buttons">
            <Button onClick={this.handleFinishSession}>
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
  defaultServer: PropTypes.object,
};

ExportSection.defaultProps = {
  defaultServer: null,
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
    deleteSession: bindActionCreators(sessionsActions.removeSession, dispatch),
    endSession: (deleteAfterExport) => {
      dispatch(sessionActions.endSession(deleteAfterExport));
    },
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FinishSession);

export { FinishSession as UnconnectedFinishSession };
