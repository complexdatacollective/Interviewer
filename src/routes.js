import React from 'react';
import {
    hashHistory,
    Route,
    Router,
    IndexRoute,
    IndexRedirect
} from 'react-router';
import NetworkService from './utils/NetworkService'
import {
  App,
  HomePage,
  Protocol
} from './containers';

const networkService = new NetworkService();

export const Routes = (
  <Route path='/' component={App} networkService={networkService}>
    <IndexRedirect to='home' />
    <IndexRoute component={HomePage} />
    <Route path='home' component={HomePage} />
    <Route path='protocol' component={Protocol} />
  </Route>
);

export default class AppRouter extends React.Component {
  render() {
    return (
      <Router routes={Routes} history={hashHistory} />
    )
  }
}
