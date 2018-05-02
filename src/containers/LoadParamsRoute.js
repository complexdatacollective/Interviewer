import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as menuActions } from '../ducks/modules/menu';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { getNextIndex, isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    if (this.props.shouldReset) {
      this.props.resetState();
      return;
    }

    if (this.props.computedMatch.params &&
      this.props.computedMatch.params.protocolId &&
      this.props.computedMatch.params.protocolId !== this.props.protocolPath) {
      if (this.props.computedMatch.params.protocolType === 'factory') {
        this.props.loadFactoryProtocol(this.props.computedMatch.params.protocolId);
      } else {
        this.props.loadProtocol(this.props.computedMatch.params.protocolId);
      }
    }

    if (this.props.computedMatch.url) { // TODO check if it already exists
      // && this.props.computedMatch.url != this.props.currentUrl) {
      this.props.addSession(0, this.props.computedMatch.url);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldReset) {
      nextProps.resetState();
      return;
    }

    if (nextProps.computedMatch.params &&
        nextProps.computedMatch.params !== this.props.computedMatch.params &&
        nextProps.computedMatch.params.protocolId &&
        nextProps.computedMatch.params.protocolId !== this.props.protocolPath) {
      if (nextProps.computedMatch.params.protocolType === 'factory') {
        this.props.loadFactoryProtocol(nextProps.computedMatch.params.protocolId);
      } else {
        this.props.loadProtocol(nextProps.computedMatch.params.protocolId);
      }
    }

    if (nextProps.computedMatch.url &&
      nextProps.computedMatch.url !== this.props.computedMatch.url) {
      // TODO should this sometimes be an "add" instead of "update"?
      this.props.updateSession(0, nextProps.computedMatch.url);
    }
  }

  render() {
    const {
      backParam,
      component: RenderComponent,
      isSkipped,
      shouldReset,
      skipToIndex,
      ...rest
    } = this.props;

    const {
      protocolId,
      protocolType,
    } = this.props.computedMatch.params;

    return (
      isSkipped ?
        (<Redirect to={
          {
            pathname: `/protocol/${protocolType}/${protocolId}/${skipToIndex}`,
            search: backParam,
          }}
        />) :
        (<RenderComponent {...rest} stageIndex={this.props.computedMatch.params.stageIndex || 0} />)
    );
  }
}

LoadParamsRoute.propTypes = {
  addSession: PropTypes.func.isRequired,
  backParam: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
  computedMatch: PropTypes.object.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  isSkipped: PropTypes.bool,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  resetState: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
  skipToIndex: PropTypes.number.isRequired,
  updateSession: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  isSkipped: false,
  protocolPath: '',
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
    skipToIndex: getNextIndex(nextIndex)(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addSession: bindActionCreators(sessionsActions.addSession, dispatch),
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    resetState: bindActionCreators(menuActions.resetState, dispatch),
    updateSession: bindActionCreators(sessionsActions.updateSession, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
