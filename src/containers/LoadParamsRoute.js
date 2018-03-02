import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as sessionActions } from '../ducks/modules/session/stage';

class LoadParamsRoute extends Component {
  componentWillMount() {
    if (this.props.computedMatch.params &&
      this.props.computedMatch.params.protocolId &&
      this.props.computedMatch.params.protocolId !== this.props.protocolPath) {
      this.props.loadFactoryProtocol(this.props.computedMatch.params.protocolId);
    }

    if (this.props.computedMatch.params &&
        this.props.computedMatch.params.stageIndex &&
        this.props.isProtocolLoaded) {
      this.props.setStageIndex(this.props.computedMatch.params.stageIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.computedMatch.params &&
        nextProps.computedMatch.params !== this.props.computedMatch.params &&
        nextProps.computedMatch.params.protocolId &&
        nextProps.computedMatch.params.protocolId !== this.props.protocolPath) {
      this.props.loadFactoryProtocol(nextProps.computedMatch.params.protocolId);
    }

    if (nextProps.computedMatch.params &&
        nextProps.computedMatch.params.stageIndex &&
        nextProps.isProtocolLoaded) {
      this.props.setStageIndex(nextProps.computedMatch.params.stageIndex);
    }
  }

  render() {
    const {
      component: RenderComponent,
      ...rest
    } = this.props;

    return (
      <RenderComponent {...rest} />
    );
  }
}

LoadParamsRoute.propTypes = {
  component: PropTypes.object.isRequired,
  computedMatch: PropTypes.object.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  setStageIndex: PropTypes.func.isRequired,
};

LoadParamsRoute.defaultProps = {
  protocolPath: '',
};

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    setStageIndex: bindActionCreators(sessionActions.setStageIndex, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
