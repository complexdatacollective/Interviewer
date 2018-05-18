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
    protocolType: state.protocol.type,
    sessionId: state.session,
  };
}

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
    <Route path="/setup" component={SetupScreen} />
    <Redirect to={{ pathname: '/setup' }} />
  </Switch>
);
