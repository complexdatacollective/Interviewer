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
    protocolPath: state.importProtocol.path,
    sessionId: state.activeSessionId,
  };
}

// If there is an activeSessionId, redirect to it
let SetupRequiredRoute = (
  { component: Component, protocolPath, sessionId, ...rest },
) => (
  sessionId ? (
    <Redirect to={{ pathname: `/session/${sessionId}/${protocolPath}/0` }} {...rest} />
  ) : (
    <Redirect to={{ pathname: '/setup' }} />
  )
);

SetupRequiredRoute.propTypes = {
  component: PropTypes.func.isRequired,
  protocolPath: PropTypes.string,
  sessionId: PropTypes.string.isRequired,
};

SetupRequiredRoute.defaultProps = {
  protocolPath: '',
};

SetupRequiredRoute = connect(mapStateToProps)(SetupRequiredRoute);

export default () => (
  <Switch>
    <SetupRequiredRoute exact path="/session" component={ProtocolScreen} />
    <LoadParamsRoute path="/session/:sessionId/:protocolId/:stageIndex" component={ProtocolScreen} />
    <LoadParamsRoute path="/session/:sessionId/:protocolId" component={ProtocolScreen} />
    <LoadParamsRoute path="/reset" shouldReset component={Redirect} to={{ pathname: '/setup' }} />
    <Route path="/protocol-import" component={ProtocolImport} />
    <Route path="/setup" component={SetupScreen} />
    <Redirect to={{ pathname: '/setup' }} />
  </Switch>
);
