import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';

import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { CardList } from '../../components';
import { matchSessionPath } from '../../utils/matchSessionPath';

const displayDate = timestamp => timestamp && new Date(timestamp).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric' });

const oneBasedIndex = i => parseInt(i || 0, 10) + 1;

const pathInfo = (sessionPath) => {
  const info = { path: sessionPath };
  const matchedPath = matchSessionPath(sessionPath);
  if (matchedPath) {
    info.sessionId = matchedPath.params.sessionId;
    info.caseId = matchedPath.params.caseId;
    info.protocol = matchedPath.params.protocolId;
    info.stageIndex = matchedPath.params.stageIndex;
  }
  return info;
};

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
class SessionList extends Component {
  onClickLoadSession = (session) => {
    const pathname = this.props.getSessionPath(session.uuid);
    this.props.setSession(session.uuid);
    this.props.loadSession(pathname);
  }

  render() {
    const { protocolData, removeSession, sessions } = this.props;
    // Display most recent first, and filter out any session that doesn't have a protocol
    const sessionList = Object.keys(sessions)
      .map(key => ({ uuid: key, value: sessions[key] }));
    sessionList.sort((a, b) => b.value.updatedAt - a.value.updatedAt);

    if (isEmpty(sessionList)) {
      return emptyView;
    }

    return (
      <div className="session-list__wrapper">
        <CardList
          compact
          multiselect={false}
          onDeleteCard={(data) => {
            // eslint-disable-next-line no-alert
            if (confirm('Delete this interview?')) {
              removeSession(data.uuid);
            }
          }}
          label={sessionInfo => sessionInfo.value.caseId}
          nodes={sessionList}
          onToggleCard={this.onClickLoadSession}
          getKey={sessionInfo => sessionInfo.uuid}
          details={(sessionInfo) => {
            const session = sessionInfo.value;
            const info = pathInfo(session.path);
            const exportedAt = session.lastExportedAt;
            const exportedDisplay = exportedAt ? new Date(exportedAt).toLocaleString() : 'never';
            const protocol = protocolData[session.protocolPath] || {};
            const protocolLabel = protocol.name || '[version out of date]';
            return [
              { 'Last Changed': displayDate(session.updatedAt) },
              { Protocol: protocolLabel },
              { Stage: oneBasedIndex(info.stageIndex) },
              { Exported: exportedDisplay },
            ];
          }}
        />
      </div>
    );
  }
}

SessionList.propTypes = {
  getSessionPath: PropTypes.func.isRequired,
  loadSession: PropTypes.func.isRequired,
  protocolData: PropTypes.object.isRequired,
  removeSession: PropTypes.func.isRequired,
  sessions: PropTypes.object.isRequired,
  setSession: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    protocolData: state.installedProtocols,
    getSessionPath: sessionId => state.sessions[sessionId].path,
    sessions: state.sessions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadSession: path => dispatch(push(path)),
    removeSession: bindActionCreators(sessionsActions.removeSession, dispatch),
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
