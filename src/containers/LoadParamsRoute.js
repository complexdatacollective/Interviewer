import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';
import { actionCreators as resetActions } from '../ducks/modules/reset';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    const { params } = this.props.computedMatch;
    this.props.setSession(params.sessionId);

    if (this.props.shouldReset) {
      this.props.resetState();
      return;
    }
    if (this.props.sessionId) {
      this.props.updatePrompt(0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldReset) {
      nextProps.resetState();
      return;
    }

    const { params: nextParams } = nextProps.computedMatch;

    // Reset promptIndex when stage changes.
    if (nextParams && nextParams.stageIndex && nextParams.stageIndex !== this.props.stageIndex) {
      this.props.updateStage(parseInt(nextParams.stageIndex, 10));
      this.props.updatePrompt(0);
    }
  }

  render() {
    const {
      backParam,
      component: RenderComponent,
      isSkipped,
      shouldReset,
      stageIndex,
      ...rest
    } = this.props;

    const {
      sessionId,
    } = this.props.computedMatch.params;

    const finishedLoading = this.props.sessionId;
    if (!shouldReset && !finishedLoading) { return null; }

    return (
      isSkipped ?
        (<Redirect to={
          {
            pathname: `/session/${sessionId}/${stageIndex}`,
            search: backParam,
          }}
        />) :
        (<RenderComponent
          {...rest}
          stageIndex={this.props.computedMatch.params.stageIndex || 0}
          stageBackward={!!backParam}
        />)
    );
  }
}

LoadParamsRoute.propTypes = {
  backParam: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
  computedMatch: PropTypes.object.isRequired,
  isSkipped: PropTypes.bool,
  resetState: PropTypes.func.isRequired,
  sessionId: PropTypes.string,
  sessionUrl: PropTypes.string,
  setSession: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  stageIndex: PropTypes.number.isRequired,
  updatePrompt: PropTypes.func.isRequired,
  updateStage: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  isSkipped: false,
  sessionId: '',
  sessionUrl: '/setup',
  shouldReset: false,
};

function mapStateToProps(state, ownProps) {
  // let nextIndex = Math.trunc(ownProps.computedMatch.params.stageIndex) + 1;
  // if (ownProps.location && ownProps.location.search === '?back') {
  //   nextIndex = Math.trunc(ownProps.computedMatch.params.stageIndex) - 1;
  // }

  return {
    backParam: ownProps.location.search,
    isSkipped: isStageSkipped(ownProps.computedMatch.params.stageIndex)(state),
    sessionId: state.activeSessionId,
    // stageIndex: getNextIndex(nextIndex)(state),
    stageIndex: state.activeSessionId && state.sessions[state.activeSessionId].stageIndex,
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

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
