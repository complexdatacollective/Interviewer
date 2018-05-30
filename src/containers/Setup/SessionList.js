import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';

import { actionCreators as sessionActions } from '../../ducks/modules/session';
import { CardList } from '../../components';

/**
  * Display stored sessions
  */
class SessionList extends Component {
  onClickLoadSession = (session) => {
    const pathname = this.props.getSessionPath(session.uid);
    this.props.setSession(session.uid);
    this.props.loadSession(pathname);
  }

  render() {
    const { sessions } = this.props;

    return (
      <CardList
        label={sessionInfo => sessionInfo.key}
        nodes={Object.keys(sessions).map(key => ({ uid: key, value: sessions[key] }))}
        onToggleCard={this.onClickLoadSession}
        details={sessionInfo => [
          { Path: sessionInfo.value.path },
          { Prompt: sessionInfo.value.promptIndex },
          { 'Number of Nodes': sessionInfo.value.network.nodes.length },
          { 'Number of Edges': sessionInfo.value.network.edges.length },
        ]}
      />
    );
  }
}

SessionList.propTypes = {
  getSessionPath: PropTypes.func.isRequired,
  loadSession: PropTypes.func.isRequired,
  sessions: PropTypes.object.isRequired,
  setSession: PropTypes.func.isRequired,
};

SessionList.defaultProps = {
};

function mapStateToProps(state) {
  return {
    getSessionPath: sessionId => state.sessions[sessionId].path,
    sessions: state.sessions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadSession: path => dispatch(push(path)),
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionList);
