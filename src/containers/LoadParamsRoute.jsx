import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { actionCreators as resetActions } from '../ducks/modules/reset';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';

class LoadParamsRoute extends Component {
  UNSAFE_componentWillMount() {
    const {
      computedMatch,
      setSession,
      shouldReset,
      resetState,
      sessionId,
      updatePrompt,
    } = this.props;

    setSession(computedMatch.params.sessionId);

    if (shouldReset) {
      resetState();
      return;
    }
    if (sessionId) {
      updatePrompt(0);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { stageIndex, updatePrompt, updateStage } = this.props;

    if (nextProps.shouldReset) {
      nextProps.resetState();
      return;
    }

    const { params: nextParams } = nextProps.computedMatch;

    // Reset promptIndex when stage changes.
    if (
      nextParams?.stageIndex && // there's a stage index
      nextParams.stageIndex !== stageIndex && // the new stage index is different
      nextProps.sessionId // We still have an active session
    ) {
      updateStage(Number.parseInt(nextParams.stageIndex, 10));
      updatePrompt(0);
    }
  }

  render() {
    const {
      backParam,
      component: RenderComponent,
      shouldReset,
      stageIndex,
      ...rest
    } = this.props;

    const finishedLoading = rest.sessionId;
    if (!shouldReset && !finishedLoading) {
      return null;
    }

    return (
      <RenderComponent
        {...rest}
        stageIndex={
          Number.parseInt(rest.computedMatch.params.stageIndex, 10) || 0
        }
        stageBackward={!!backParam}
      />
    );
  }
}

LoadParamsRoute.propTypes = {
  backParam: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  computedMatch: PropTypes.object.isRequired,
  resetState: PropTypes.func.isRequired,
  sessionId: PropTypes.string,
  sessionUrl: PropTypes.string,
  setSession: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  stageIndex: PropTypes.number,
  updatePrompt: PropTypes.func.isRequired,
  updateStage: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  sessionId: '',
  sessionUrl: '/setup',
  shouldReset: false,
  stageIndex: 0,
};

function mapStateToProps(state, ownProps) {
  return {
    backParam: ownProps.location.search,
    sessionId: state.activeSessionId,
    stageIndex:
      state.activeSessionId && state.sessions[state.activeSessionId].stageIndex,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetState: bindActionCreators(resetActions.resetAppState, dispatch),
    updatePrompt: bindActionCreators(sessionsActions.updatePrompt, dispatch),
    updateStage: bindActionCreators(sessionsActions.updateStage, dispatch),
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  LoadParamsRoute,
);
