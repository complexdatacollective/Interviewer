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
} from './containers';

import { ProtocolImport, SetupScreen } from './containers/Setup';

function mapStateToProps(state) {
  return {
    isProtocolLoaded: state.activeProtocol.isLoaded,
    protocolPath: state.activeProtocol.path,
    protocolType: state.activeProtocol.type,
    sessionId: state.activeSessionId,
  };
}

// If there is a loaded protocol, redirect to the current active session (!incorrect assumption)
// If not, show the setup route.
let SetupRequiredRoute = (
  { component: Component, protocolPath, protocolType, sessionId, ...rest },
) => (
  rest.isProtocolLoaded ? (
    <Redirect to={{ pathname: `/session/${sessionId}/${protocolType}/${protocolPath}/0` }} {...rest} />
  ) : (
    <Redirect to={{ pathname: '/setup' }} />
  )
);

SetupRequiredRoute.propTypes = {
  component: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  protocolType: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
};

SetupRequiredRoute.defaultProps = {
  protocolPath: '',
};

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);

export default () => (
  <Switch>
    <SetupRequiredRoute exact path="/session" component={ProtocolScreen} />
    <LoadParamsRoute path="/session/:sessionId/:protocolType/:protocolId/:stageIndex" component={ProtocolScreen} />
    <LoadParamsRoute path="/session/:sessionId/:protocolType/:protocolId" component={ProtocolScreen} />
    <LoadParamsRoute path="/reset" shouldReset component={Redirect} to={{ pathname: '/setup' }} />
    <Route path="/protocol-import" component={ProtocolImport} />
    <Route path="/setup" component={SetupScreen} />
    <Redirect to={{ pathname: '/setup' }} />
  </Switch>
);
