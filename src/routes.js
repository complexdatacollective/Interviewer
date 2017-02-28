import React from 'react';
import {
    hashHistory,
    Route,
    Router
} from 'react-router';
import NetworkService from './utils/NetworkService'
import {
  HomePage
} from './containers';

const networkService = new NetworkService();

export const Routes = (
  <Route path='/' component={HomePage} networkService={networkService} />
);

export default class AppRouter extends React.Component {
  render() {
    return (
      <Router routes={Routes} history={hashHistory} />
    )
  }
}
