import React from 'react';
import PropTypes from 'prop-types';
import {
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { connect } from 'react-redux';

import {
  LoadParamsRoute,
  ProtocolScreen,
  SetupScreen,
} from './containers';

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.protocol.isLoaded,
    protocolPath: state.protocol.path,
  };
}

let SetupRequiredRoute = ({ component: Component, protocolPath, ...rest }) => (
  rest.isProtocolLoaded ? (
    <Redirect to={{ pathname: `/protocol/${protocolPath}/0` }} {...rest} />
  ) : (
    <Redirect to={{ pathname: '/setup' }} />
  )
);

SetupRequiredRoute.propTypes = {
  component: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
};

SetupRequiredRoute.defaultProps = {
  protocolPath: '',
};

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);

export default () => (
  <Switch>
    <SetupRequiredRoute exact path="/protocol" component={ProtocolScreen} />
    <LoadParamsRoute path="/protocol/:protocolId/:stageIndex" component={ProtocolScreen} />
    <LoadParamsRoute path="/protocol/:protocolId" component={ProtocolScreen} />
    <LoadParamsRoute path="/reset" shouldReset component={Redirect} to={{ pathname: '/setup' }} />
    <Route path="/setup" component={SetupScreen} />
    <Redirect to={{ pathname: '/setup' }} />
  </Switch>
);
