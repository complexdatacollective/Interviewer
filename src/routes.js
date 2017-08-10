/* eslint-disable */

import React from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
import {
  HomeScreen,
  ProtocolScreen,
  SetupScreen,
} from './containers';

function mapStateToProps(state) {
  return {
    protocolLoaded: state.protocol.loaded,
  };
}

const SetupRequiredRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      rest.protocolLoaded ? (
        <Component {...props} />
      ) : (
        <Redirect to={{ pathname: '/setup' }} />
      )
    )}
  />
);

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);


export default () => (
  <Router>
    <Switch>
      <SetupRequiredRoute path="/protocol" component={ProtocolScreen} />
      <SetupRequiredRoute exact path="/" component={HomeScreen} />
      <Route path="/setup" component={SetupScreen} />
      <Redirect to={{ pathname: '/setup' }} />
    </Switch>
  </Router>
);
