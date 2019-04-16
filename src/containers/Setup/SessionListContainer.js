import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { actionCreators as dialogActions } from '../../ducks/modules/dialogs';
import { FilterableListWrapper, SessionList, NodeBin } from '../../components';
import { entityAttributesProperty } from '../../ducks/modules/network';

const displayDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' });

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const emptyView = (
  <div className="session-list--empty">
    <h1 className="session-list__header">No previous interviews found</h1>
    <p>
      To begin one, select a protocol from <Link to="/">Start new interview</Link>,
      or import a protocol from Network Canvas Server by using the
      button in the lower-right corner of this screen.
    </p>
  </div>
);

/**
  * Display stored sessions
  */
class SessionListContainer extends Component {
  onClickLoadSession = (session) => {
    this.props.setSession(session.uuid);
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
    const { installedProtocols, sessions } = this.props;
    // Display most recent first, and filter out any session that doesn't have a protocol
    const sessionList = Object.keys(sessions)
      .map(key => ({ uuid: key, [entityAttributesProperty]: sessions[key] }));

    if (isEmpty(sessionList)) {
      return emptyView;
    }

    return (
      <div className="session-list__wrapper">
        <FilterableListWrapper
          ListComponent={SessionList}
          listComponentProps={{
            id: 'session-list',
            label: sessionInfo => sessionInfo[entityAttributesProperty].caseId,
            onItemClick: this.onClickLoadSession,
            getKey: sessionInfo => sessionInfo.uuid,
            details: (sessionInfo) => {
              const session = sessionInfo[entityAttributesProperty];
              const exportedAt = session.lastExportedAt;
              const exportedDisplay = exportedAt ? new Date(exportedAt).toLocaleString() : 'never';
              const protocol = installedProtocols[session.protocolUID] || {};
              const protocolLabel = protocol.name || '[version out of date]';
              return [
                { 'Last Changed': displayDate(session.updatedAt) },
                { Protocol: protocolLabel },
                { Stage: oneBasedIndex(session.stageIndex) },
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
        <NodeBin
          accepts={() => true}
          dropHandler={meta => this.onDeleteCard(meta.uuid)}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

SessionListContainer.propTypes = {
  installedProtocols: PropTypes.object.isRequired,
  removeSession: PropTypes.func.isRequired,
  sessions: PropTypes.object.isRequired,
  setSession: PropTypes.func.isRequired,
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
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
    openDialog: bindActionCreators(dialogActions.openDialog, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionListContainer);
