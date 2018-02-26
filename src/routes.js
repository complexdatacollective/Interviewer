/* eslint-disable */

import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { actionCreators as protocolActions } from './ducks/modules/protocol';
import { actionCreators as sessionActions } from './ducks/modules/session/stage';
import {
  ProtocolScreen,
  SetupScreen,
} from './containers';

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadFactoryProtocol: bindActionCreators(protocolActions.loadFactoryProtocol, dispatch),
    setStageIndex: bindActionCreators(sessionActions.setStageIndex, dispatch),
  };
}

class ParamsRoute extends Component {
  componentWillMount() {
    if (this.props.computedMatch.params && this.props.computedMatch.params.protocolId) {
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
        nextProps.computedMatch.params.protocolId) {
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
      component: Component,
      ...rest
    } = this.props;

    return (
      <Component {...rest} />
    );
  }
}

const LoadParamsRoute = connect(mapStateToProps, mapDispatchToProps)(ParamsRoute);

let SetupRequiredRoute = ({ component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => (
      rest.isProtocolLoaded ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: '/setup' }} />
      )
    )}
  />
);

SetupRequiredRoute = connect(mapStateToProps, mapDispatchToProps)(SetupRequiredRoute);

export default () => (
  <Router>
    <Switch>
      <SetupRequiredRoute exact path="/protocol" component={ProtocolScreen} />
      <LoadParamsRoute path="/protocol/:protocolId/:stageIndex" component={ProtocolScreen} />
      <LoadParamsRoute path="/protocol/:protocolId" component={ProtocolScreen} />
      <Route path="/setup" component={SetupScreen} />
      <Redirect to={{ pathname: '/setup' }} />
    </Switch>
  </Router>
);
