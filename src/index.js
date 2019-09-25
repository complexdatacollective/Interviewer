/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ready as secureCommsReady } from 'secure-comms-api/cipher';
import { Provider } from 'react-redux';
import { ConnectedRouter, push } from 'react-router-redux';
import initFileOpener from './utils/initFileOpener';
import { history, store, persistor } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
import { Spinner } from './ui/components';
import App from './containers/App';
import { isCordova, isElectron, getEnv } from './utils/Environment';
import AppRouter from './routes';
import remote from './utils/remote';

// This prevents user from being able to drop a file anywhere on the app
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

const env = getEnv();

const Persist = ({ persistor, children }) => {
  if (env.REACT_APP_NO_PERSIST) {
    return children;
  }

  return (
    <PersistGate loading={<Spinner />} persistor={persistor}>
      {children}
    </PersistGate>
  );
};

const startApp = () => {
  store.dispatch(deviceActions.deviceReady());

  ReactDOM.render(
    <Provider store={store}>
      <Persist persistor={persistor}>
        <ConnectedRouter history={history}>
          <App>
            <AppRouter />
          </App>
        </ConnectedRouter>
      </Persist>
    </Provider>,
    document.getElementById('root'),
  );
};

if (isElectron()) {
  const { webFrame, ipcRenderer } = require('electron'); // eslint-disable-line global-require
  webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
  webFrame.registerURLSchemeAsPrivileged('asset');
  remote.init();

  ipcRenderer.on('RESET_STATE', () => {
    store.dispatch(push('/reset'));
  });
}

secureCommsReady.then(() => {
  if (isCordova()) {
    document.addEventListener('deviceready', startApp, false);
  } else if (document.readyState === 'complete') {
    startApp();
    // Listen for file open events.
    initFileOpener();
  } else {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        startApp();
        // Listen for file open events.
        initFileOpener();
      }
    };
  }
});
