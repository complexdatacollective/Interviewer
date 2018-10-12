import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as sessionActions } from '../ducks/modules/session';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getNextIndex, isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    const { params, url } = this.props.computedMatch;

    if (params && params.sessionId) {
      if (this.props.sessionId !== params.sessionId) {
        const protocolType = (params.protocolId && params.protocolId !== this.props.protocolPath) ?
          params.protocolType : '';
        this.props.setSession(params.sessionId, protocolType);
      }
      if (url !== this.props.sessionUrl) {
        this.props.updateSession(params.sessionId, url);
      }
    }

    if (params && params.protocolId && params.protocolId !== this.props.protocolPath) {
      if (params.protocolType === 'factory') {
        this.props.loadFactoryProtocol(params.protocolId);
      } else {
        this.props.loadProtocol(params.protocolId);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { params: nextParams, url: nextUrl } = nextProps.computedMatch;
    const { params } = this.props.computedMatch;

    if (nextParams && nextParams.sessionId) {
      if (this.props.sessionId !== nextParams.sessionId) {
        const protocolType =
          (nextParams.protocolId && nextParams.protocolId !== this.props.protocolPath) ?
            nextParams.protocolType : '';
        this.props.setSession(nextParams.sessionId, protocolType);
      } else if (nextUrl && nextUrl !== this.props.sessionUrl) {
        this.props.updateSession(nextParams.sessionId, nextUrl);
      }
    }

    if (nextParams && nextParams !== params && nextParams.protocolId &&
        nextParams.protocolId !== this.props.protocolPath) {
      if (nextParams.protocolType === 'factory') {
        this.props.loadFactoryProtocol(nextParams.protocolId);
      } else {
        this.props.loadProtocol(nextParams.protocolId);
      }
    }
  }

  render() {
    const {
      backParam,
      component: RenderComponent,
      isProtocolLoaded,
      isSkipped,
      shouldReset,
      skipToIndex,
      ...rest
    } = this.props;

    const {
      protocolId,
      protocolType,
      sessionId,
    } = this.props.computedMatch.params;

    const finishedLoading = isProtocolLoaded && this.props.sessionId === sessionId;
    if (!shouldReset && !finishedLoading) { return null; }

    return (
      isSkipped ?
        (<Redirect to={
          {
            pathname: `/session/${sessionId}/${protocolType}/${protocolId}/${skipToIndex}`,
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
  isProtocolLoaded: PropTypes.bool.isRequired,
  isSkipped: PropTypes.bool,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  sessionId: PropTypes.string.isRequired,
  sessionUrl: PropTypes.string,
  setSession: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  skipToIndex: PropTypes.number.isRequired,
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
    isProtocolLoaded: state.protocol.isLoaded,
    isSkipped: isStageSkipped(ownProps.computedMatch.params.stageIndex)(state),
    protocolPath: state.protocol.path,
    sessionId: state.session,
    sessionUrl: state.sessions[state.session] && state.sessions[state.session].path,
    skipToIndex: getNextIndex(nextIndex)(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    setSession: bindActionCreators(sessionActions.setSession, dispatch),
    updateSession: bindActionCreators(sessionsActions.updateSession, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
