import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';

import saveFile from '../../utils/SaveFile';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { getRemoteProtocolId } from '../../selectors/protocol';
import { ExportSessionsOverlay } from '../Setup';
import Scroller from '../../components/Scroller';

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
      deleteAfterFinish: false,
    };
  }

  get exportSection() {
    const { defaultServer } = this.props;
    return (
      <ExportSection defaultServer={defaultServer}>
        <Button onClick={this.handleOpenExport}>
          Upload
        </Button>
      </ExportSection>
    );
  }

  get exportUrl() {
    const { defaultServer } = this.props;
    return defaultServer && defaultServer.secureServiceUrl;
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

  handleExport = () => {
    saveFile(
      [this.props.sessionId],
      this.props.sessions,
      this.props.installedProtocols)
      .catch(err => this.handleExportError(err));
  };

  handleFinishSession = () => {
    if (this.state.deleteAfterFinish) {
      this.props.openDialog({
        type: 'Warning',
        title: 'Finish and delete?',
        confirmLabel: 'Finish and delete',
        onConfirm: () => this.props.endSession(this.state.deleteAfterFinish),
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
      this.props.endSession(this.state.deleteAfterFinish);
    }
  };

  handleToggleDelete = () =>
    this.setState({ deleteAfterFinish: !this.state.deleteAfterFinish });

  handleOpenExport = () => {
    this.setState({
      showExportSessionOverlay: true,
    });
  }

  handleCloseExport = () => {
    this.setState({
      showExportSessionOverlay: false,
    });
    this.props.resetSessionExport();
  }

  render() {
    return (
      <div className="interface finish-session-interface">
        <ExportSessionsOverlay
          show={this.state.showExportSessionOverlay}
          key={this.state.showExportSessionOverlay}
          onClose={this.handleCloseExport}
          sessionsToExport={[this.props.sessionId]}
        />
        <div className="finish-session-interface__frame">
          <h1 className="finish-session-interface__title type--title-1">
            Finish Interview
          </h1>
          <Scroller>
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
                <Button color="platinum" onClick={this.handleExport}>
                  Export
                </Button>
              </div>
            </div>
            <Toggle
              input={{
                value: this.state.deleteAfterFinish,
                onChange: this.handleToggleDelete,
              }}
              label="Delete this session after finishing?"
              fieldLabel=" "
            />

          </Scroller>
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
  defaultServer: PropTypes.object,
  endSession: PropTypes.func.isRequired,
  resetSessionExport: PropTypes.func.isRequired,
  openDialog: PropTypes.func.isRequired,
  sessionId: PropTypes.string.isRequired,
  sessions: PropTypes.object.isRequired,
  installedProtocols: PropTypes.object.isRequired,
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
    remoteProtocolId: getRemoteProtocolId(state),
    sessionId: state.activeSessionId,
    defaultServer: state.pairedServer,
    sessions: state.sessions,
    installedProtocols: state.installedProtocols,
  };
}

const mapDispatchToProps = {
  bulkExportSessions: sessionsActions.bulkExportSessions,
  resetSessionExport: sessionsActions.sessionExportReset,
  deleteSession: sessionsActions.removeSession,
  endSession: sessionActions.endSession,
  openDialog: dialogActions.openDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(FinishSession);

export { FinishSession as UnconnectedFinishSession };
