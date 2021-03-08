import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actionCreators as resetActions } from '../ducks/modules/reset';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { actionCreators as sessionActions } from '../ducks/modules/session';

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
    if (
      nextParams // there are new params
      && nextParams.stageIndex // there's a stage index
      && nextParams.stageIndex !== this.props.stageIndex // the new stage index is different
      && nextProps.sessionId // We still have an active session
    ) {
      this.props.updateStage(parseInt(nextParams.stageIndex, 10));
      this.props.updatePrompt(0);
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

    const finishedLoading = this.props.sessionId;
    if (!shouldReset && !finishedLoading) { return null; }

    return (
      <RenderComponent
        {...rest}
        stageIndex={this.props.computedMatch.params.stageIndex || 0}
        stageBackward={!!backParam}
      />
    );
  }
}

LoadParamsRoute.propTypes = {
  backParam: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
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
