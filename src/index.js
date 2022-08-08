import React from 'react';
import { webFrame, ipcRenderer } from 'electron';
import ReactDOM from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ready as secureCommsReady } from 'secure-comms-api/cipher';
import { Provider } from 'react-redux';
import { ConnectedRouter, push } from 'connected-react-router';
import initFileOpener from './utils/initFileOpener';
import initMenuActions from './utils/initMenuActions';
import { history, store, persistor as storePersistor } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
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
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
};

const startApp = () => {
  store.dispatch(deviceActions.deviceReady());

  ReactDOM.render(
    <Provider store={store}>
      <Persist persistor={storePersistor}>
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
  webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
  remote.init();

  // Listen for native menu UI events
  initMenuActions();

  ipcRenderer.on('RESET_STATE', () => {
    store.dispatch(push('/reset'));
  });
}

secureCommsReady.then(() => {
  if (isCordova()) {
    document.addEventListener('deviceready', startApp, false);
  } else if (isElectron()) {
    const start = () => {
      startApp();
      initFileOpener();
    };

    // If document is already ready, start the app.
    if (document.readyState === 'complete') { start(); }

    // Else bind an event listener
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') { start(); }
    };
  } else {
    // Browser
    startApp();
  }
});
