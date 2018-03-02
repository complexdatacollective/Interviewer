import React from 'react';
import PropTypes from 'prop-types';
import {
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import { history } from './ducks/store';
import {
  LoadParamsRoute,
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

SetupRequiredRoute.propTypes = {
  component: PropTypes.object.isRequired,
};

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);

export default () => (
  <ConnectedRouter history={history}>
    <Switch>
      <SetupRequiredRoute exact path="/protocol" component={ProtocolScreen} />
      <LoadParamsRoute path="/protocol/:protocolId/:stageIndex" component={ProtocolScreen} />
      <LoadParamsRoute path="/protocol/:protocolId" component={ProtocolScreen} />
      <Route path="/setup" component={SetupScreen} />
      <Redirect to={{ pathname: '/setup' }} />
    </Switch>
  </ConnectedRouter>
);
