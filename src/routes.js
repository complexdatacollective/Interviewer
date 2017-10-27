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
  ProtocolScreen,
  SetupScreen,
} from './containers';

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
  };
}

let SetupRequiredRoute = ({ component: Component, ...rest }) => (
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

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);


export default () => (
  <Router>
    <Switch>
      <SetupRequiredRoute path="/protocol" component={ProtocolScreen} />
      <Route path="/setup" component={SetupScreen} />
      <Redirect to={{ pathname: '/setup' }} />
    </Switch>
  </Router>
);
