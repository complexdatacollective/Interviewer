/* eslint-disable no-console */

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { Provider } from 'react-redux';

import { store } from './ducks/store';
import App from './containers/App';
import AppRouter from './routes';

injectTapEventPlugin();

function startApp() {
  ReactDOM.render(
    <Provider store={store}>
      <App>
        <AppRouter />
      </App>
    </Provider>,
    document.getElementById('root'),
  );
}
if (window.cordova) {
  console.log('cordova');
  document.addEventListener('deviceready', startApp, false);
} else {
  console.log('not cordova');
  startApp();
}
