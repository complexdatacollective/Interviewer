import React from 'react';
import {
    browserHistory,
    Route,
    Router,
    IndexRoute,
    IndexRedirect,
} from 'react-router';
import NetworkService from './utils/NetworkService';
import {
  App,
  HomePage,
  Protocol,
} from './containers';

const networkService = new NetworkService();

export const Routes = (
  <Route path="/" component={App} base="/" networkService={networkService}>
    <IndexRedirect to="home" />
    <IndexRoute component={HomePage} />
    <Route path="home" component={HomePage} />
    <Route path="protocol" component={Protocol} />
  </Route>
);

export default () => <Router routes={Routes} history={browserHistory} />;
