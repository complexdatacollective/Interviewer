import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEmpty, get } from 'lodash';
import { Button } from '@codaco/ui';
import { Toggle } from '@codaco/ui/lib/components/Fields';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as exportActions } from '../../ducks/modules/exportProcess';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { FilterableListWrapper, SessionList, NodeBin } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';
import { ExportSessionsOverlay } from '.';

const displayDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

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
class SessionListContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showExportSessionsOverlay: false,
      selectedSessions: [],
    };
  }

  onSelectSession = (session) => {
    if (this.isSelected(session.uuid)) {
      this.setState({
        selectedSessions: this.state.selectedSessions.filter(item => item !== session.uuid),
      });
    } else {
      this.setState({
        selectedSessions: [...this.state.selectedSessions, session.uuid],
      });
    }
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

  isSelected = uuid => this.state.selectedSessions.includes(uuid);

  render() {
    const { installedProtocols, sessions, sessionExportReset } = this.props;
    // Display most recent first, and filter out any session that doesn't have a protocol
    const sessionList = Object.keys(sessions)
      .map(key => ({ uuid: key, [entityAttributesProperty]: sessions[key] }));

    if (isEmpty(sessionList)) {
      return emptyView;
    }

    return (
      <React.Fragment>
        <ExportSessionsOverlay
          show={this.state.showExportSessionsOverlay}
          key={this.state.showExportSessionsOverlay}
          onClose={() => {
            this.setState({
              showExportSessionsOverlay: false,
              selectedSessions: [],
            });

            sessionExportReset();
          }}
          sessionsToExport={this.state.selectedSessions}
        />
        <div className="session-list-container__wrapper">
          <FilterableListWrapper
            ListComponent={SessionList}
            listComponentProps={{
              id: 'session-list-container',
              label: sessionInfo => sessionInfo[entityAttributesProperty].caseId,
              onItemSelect: this.onSelectSession,
              isItemSelected: item => this.isSelected(item.uuid),
              getKey: sessionInfo => sessionInfo.uuid,
              progress: (sessionInfo) => {
                const session = sessionInfo[entityAttributesProperty];
                const protocolStages = get(installedProtocols, [session.protocolUID, 'stages'], []);
                const numberOfProtocolStages = oneBasedIndex(protocolStages.length);

                return Math.round(
                  (oneBasedIndex(session.stageIndex) / numberOfProtocolStages) * 100,
                );
              },
              details: (sessionInfo) => {
                const session = sessionInfo[entityAttributesProperty];
                const exportedAt = session.lastExportedAt;
                const exportedDisplay = exportedAt ? displayDate(exportedAt) : 'never';
                const protocol = installedProtocols[session.protocolUID] || {};
                const protocolLabel = protocol.name || '[version out of date]';
                return [
                  { Modified: displayDate(session.updatedAt) },
                  { Protocol: protocolLabel },
                  { Exported: exportedDisplay },
                ];
              },
            }}
            items={sessionList}
            initialSortOrder={[{
              property: 'updatedAt',
              direction: 'desc',
            }]}
            sortFields={[
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
      </React.Fragment>
    );
  }
}

SessionListContainer.propTypes = {
  installedProtocols: PropTypes.object.isRequired,
  removeSession: PropTypes.func.isRequired,
  sessions: PropTypes.object.isRequired,
  openDialog: PropTypes.func.isRequired,
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
    sessionExportReset: bindActionCreators(exportActions.sessionExportReset, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionListContainer);
