/* eslint-disable no-console */

import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import { Provider } from 'react-redux';

import { store } from './ducks/store';
import App from './containers/App';
import AppRouter from './routes';
import { isCordova, isElectron } from './utils/Environment';

injectTapEventPlugin();

// Initialise auto update if we are in electron
const checkForUpdate = () => {
  if (isElectron()) {
    // update through IPC goes here
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('CHECK_FOR_UPDATE');

    ipcRenderer.on('UPDATE_FOUND', (event, arg) => {
      console.log(arg);
    });

    ipcRenderer.on('UP_TO_DATE', (event, arg) => {
      console.log(arg);
    });
  }
};

function startApp() {
  ReactDOM.render(
    <Provider store={store}>
      <App>
        <AppRouter />
      </App>
    </Provider>,
    document.getElementById('root'),
  );

  checkForUpdate();
}

if (isCordova()) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}
