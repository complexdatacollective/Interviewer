import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';

import { actionCreators as resetActions } from '../ducks/modules/reset';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getNextIndex, isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    if (this.props.shouldReset) {
      this.props.resetState();
      return;
    }

    const { params, url } = this.props.computedMatch;

    if (params && params.sessionId) {
      if (this.props.sessionId !== params.sessionId) {
        this.props.setSession(params.sessionId);
      }
      if (url !== this.props.sessionUrl) {
        this.props.updateSession(params.sessionId, url);
      }
    }

    // Switch protocol if the path is different.
    // if (params && params.protocolId && params.protocolId !== this.props.protocolPath) {
    //   this.props.loadProtocol(params.protocolId);
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldReset) {
      nextProps.resetState();
      return;
    }

    const { params: nextParams, url: nextUrl } = nextProps.computedMatch;

    if (nextParams && nextParams.sessionId) {
      if (this.props.sessionId !== nextParams.sessionId) {
        this.props.setSession(nextParams.sessionId);
      } else if (nextUrl && nextUrl !== this.props.sessionUrl) {
        this.props.updateSession(nextParams.sessionId, nextUrl);
      }
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
      protocolId,
      sessionId,
    } = this.props.computedMatch.params;

    const finishedLoading = this.props.sessionId === sessionId;
    if (!shouldReset && !finishedLoading) { return null; }

    return (
      isSkipped ?
        (<Redirect to={
          {
            pathname: `/session/${sessionId}/${protocolId}/${stageIndex}`,
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
  protocolPath: PropTypes.string,
  resetState: PropTypes.func.isRequired,
  sessionId: PropTypes.string.isRequired,
  sessionUrl: PropTypes.string,
  setSession: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  stageIndex: PropTypes.number.isRequired,
  updateSession: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  isSkipped: false,
  protocolPath: '',
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
    protocolPath: state.importProtocol.path,
    sessionId: state.activeSessionId,
    sessionUrl: state.sessions[state.activeSessionId] && state.sessions[state.activeSessionId].path,
    stageIndex: getNextIndex(nextIndex)(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    resetState: bindActionCreators(resetActions.resetAppState, dispatch),
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
    updateSession: bindActionCreators(sessionsActions.updateSession, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
