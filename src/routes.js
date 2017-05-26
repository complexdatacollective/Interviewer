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
  HomePage,
  Protocol,
  Setup,
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
      <SetupRequiredRoute path="/protocol" component={Protocol} />
      <SetupRequiredRoute exact path="/" component={HomePage} />
      <Route path="/setup" component={Setup} />
      <Redirect to={{ pathname: '/setup' }} />
    </Switch>
  </Router>
);
