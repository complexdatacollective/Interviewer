import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';

import { actionCreators as protocolActions } from '../ducks/modules/protocol';
import { actionCreators as menuActions } from '../ducks/modules/menu';

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
      component: RenderComponent,
      shouldReset,
      ...rest
    } = this.props;

    return (
      <RenderComponent {...rest} stageIndex={this.props.computedMatch.params.stageIndex || 0} />
    );
  }
}

LoadParamsRoute.propTypes = {
  component: PropTypes.func.isRequired,
  computedMatch: PropTypes.object.isRequired,
  isProtocolLoaded: PropTypes.bool.isRequired,
  loadFactoryProtocol: PropTypes.func.isRequired,
  loadProtocol: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  resetState: PropTypes.func.isRequired,
  shouldReset: PropTypes.bool,
};

LoadParamsRoute.defaultProps = {
  protocolPath: '',
  shouldReset: false,
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
    loadProtocol: bindActionCreators(protocolActions.loadProtocol, dispatch),
    resetState: bindActionCreators(menuActions.resetState, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(LoadParamsRoute);
