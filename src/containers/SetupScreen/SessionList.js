import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEmpty, get } from 'lodash';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { NewFilterableListWrapper, NodeBin, SessionCard } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';
import ExportSessionsOverlay from '../ExportSessions/ExportSessionsOverlay';

const emptyView = (
  <div className="session-list-container--empty">
    <div className="getting-started">
      <h1 className="getting-started__header">No previous interviews found</h1>
      <p>
        You have no in-progress interview sessions available to resume.
        To begin a new session, select a protocol from the main start screen.
      </p>
    </div>
  </div>
);

/**
  * Display stored sessions
  */
class SessionList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showExportSessionsOverlay: false,
      selectedSessions: [],
    };
  }

  onDeleteCard = (uuid) => {
    this.props.openDialog({
      type: 'Warning',
      title: 'Delete this interview session?',
      confirmLabel: 'Delete session',
      onConfirm: () => this.props.removeSession(uuid),
      message: (
        <p>
          This action will delete this interview session, and cannot be undone. Continue?
        </p>
      ),
    });
  };

  render() {
    const { sessions } = this.props;
    // Display most recent first, and filter out any session that doesn't have a protocol
    const sessionList = Object.keys(sessions)
      .map(key => ({ sessionUUID: key, [entityAttributesProperty]: sessions[key] }));

    if (isEmpty(sessionList)) {
      return emptyView;
    }

    return (
      <div className="session-list">
        <NewFilterableListWrapper
          ItemComponent={SessionCard}
          items={sessionList}
          initialSortProperty="updatedAt"
          initialSortDirection="desc"
          sortableProperties={[
            {
              label: 'Last Changed',
              variable: 'updatedAt',
            },
            {
              label: 'Case ID',
              variable: 'caseId',
            },
            {
              label: 'Progress',
              variable: 'stageIndex',
            },
          ]}
        />
        { this.state.selectedSessions.length > 0 &&
        <div className="session-list-container__selected">
          <div className="selected__info">
            <h1>{this.state.selectedSessions.length} Selected</h1>
            <Toggle
              input={{
                value: this.state.selectedSessions.length === sessionList.length,
                onChange: () => {
                  if (this.state.selectedSessions.length === sessionList.length) {
                    this.setState({
                      selectedSessions: [],
                    });
                  } else {
                    this.setState({
                      selectedSessions: sessionList.map(session => session.uuid),
                    });
                  }
                },
              }}
              label="Select all"
            />
          </div>
          <Button
            onClick={() => this.setState({ showExportSessionsOverlay: true })}
          >
            Upload or Export Selected
          </Button>
        </div>
        }
        <NodeBin
          accepts={() => true}
          dropHandler={meta => this.onDeleteCard(meta.uuid)}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

SessionList.propTypes = {
  installedProtocols: PropTypes.object.isRequired,
  removeSession: PropTypes.func.isRequired,
  sessions: PropTypes.object.isRequired,
  openDialog: PropTypes.func.isRequired,
  resetSessionExport: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    installedProtocols: state.installedProtocols,
    sessions: state.sessions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    removeSession: bindActionCreators(sessionsActions.removeSession, dispatch),
    resetSessionExport: bindActionCreators(sessionsActions.sessionExportReset, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
