import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { Redirect } from 'react-router-dom';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as menuActions } from '../ducks/modules/menu';
import { getNextIndex, isStageSkipped } from '../selectors/skip-logic';

class LoadParamsRoute extends Component {
  componentWillMount() {
    if (this.props.shouldReset) {
      this.props.resetState();
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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shouldReset) {
      nextProps.resetState();
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
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    resetState: bindActionCreators(menuActions.resetState, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
