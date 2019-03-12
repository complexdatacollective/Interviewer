import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';
import { get } from 'lodash';
import { actionCreators as resetActions } from '../ducks/modules/reset';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getNextIndex, isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    if (this.props.shouldReset) {
      this.props.resetState();
      return;
    }
    if (this.props.sessionId) {
      this.props.updatePrompt(this.props.sessionId, 0);
    }

    // const { params, url } = this.props.computedMatch;
    // // params: sessionID, protocolUID, stageIndex
    // if (params && params.sessionId) {
    //   // if (this.props.sessionId !== params.sessionId) {
    //   //   this.props.setSession(params.sessionId);
    //   // }
    //   // if (url !== this.props.sessionUrl) {
    //   //   this.props.updatePrompt(params.sessionId, 0);
    //   // }
    // }

    // // Switch protocol if the path is different.
    // // if (params && params.protocolUID && params.protocolUID !== this.props.protocolUID) {
    // //   this.props.loadProtocol(params.protocolUID);
    // // }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldReset) {
      nextProps.resetState();
      return;
    }

    const { params: nextParams } = nextProps.computedMatch;
    if (nextParams && nextParams.stageIndex && nextParams.stageIndex !== this.props.stageIndex) {
      this.props.updatePrompt(nextParams.sessionId, 0);
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
      protocolUID,
      sessionId,
    } = this.props.computedMatch.params;

    const finishedLoading = this.props.sessionId;
    if (!shouldReset && !finishedLoading) { return null; }

    return (
      isSkipped ?
        (<Redirect to={
          {
            pathname: `/session/${protocolUID}/${sessionId}/${stageIndex}`,
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
  protocolUID: PropTypes.string,
  resetState: PropTypes.func.isRequired,
  sessionId: PropTypes.string,
  sessionUrl: PropTypes.string,
  setSession: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  stageIndex: PropTypes.number.isRequired,
  updatePrompt: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  isSkipped: false,
  protocolUID: '',
  sessionId: '',
  sessionUrl: '/setup',
  shouldReset: false,
};

function mapStateToProps(state, ownProps) {
  let nextIndex = Math.trunc(ownProps.computedMatch.params.stageIndex) + 1;
  if (ownProps.location && ownProps.location.search === '?back') {
    nextIndex = Math.trunc(ownProps.computedMatch.params.stageIndex) - 1;
  }

  return {
    backParam: ownProps.location.search,
    isSkipped: isStageSkipped(ownProps.computedMatch.params.stageIndex)(state),
    protocolUID: get(state.sessions[state.activeSessionId], 'protocolUID'),
    sessionId: state.activeSessionId,
    stageIndex: getNextIndex(nextIndex)(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetState: bindActionCreators(resetActions.resetAppState, dispatch),
    updatePrompt: bindActionCreators(sessionsActions.updatePrompt, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
