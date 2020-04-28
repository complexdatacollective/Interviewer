import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as uiActions } from '../../ducks/modules/ui';

const SessionsOverlay = (props) => {
  // const {
  // } = props;

  return (
    <h1>SessionsOverlay</h1>
  );
};

SessionsOverlay.propTypes = {
};

SessionsOverlay.defaultProps = {
};

function mapStateToProps(state) {
  return {
    sessions: state.sessions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionsOverlay);

export { SessionsOverlay as UnconnectedSessionsOverlay };
