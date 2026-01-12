/**
 * Main entry point.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { ConnectedRouter, push } from 'connected-react-router';
import initFileOpener from './utils/initFileOpener';
import initMenuActions from './utils/initMenuActions';
import { history, store, persistor as storePersistor } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
import App from './containers/App';
import {
  isCordova,
  isElectron,
  getEnv,
  isAndroid,
} from './utils/Environment';
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

  // Enable fullscreen mode on Android using cordova-plugin-fullscreen
  if (isAndroid()) {
    window.AndroidFullScreen.isImmersiveModeSupported(() => {
      window.AndroidFullScreen.immersiveMode(() => {
        console.info('Set app into immersive mode.');

        window.addEventListener('keyboardDidHide', () => {
          console.log('keyboard hidden');
          window.AndroidFullScreen.immersiveMode();
        });
      }, () => {
        console.warn('Failed to set app into immersive mode!');
      });
    }, () => {
      console.warn('Wanted to set immersive mode, but not supported!');
    });
  }

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
  // Use secure API instead of window.require('electron')
  if (window.electronAPI?.webFrame?.setVisualZoomLevelLimits) {
    window.electronAPI.webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
  }

  remote.init();

  // Listen for native menu UI events
  initMenuActions();

  // Listen for RESET_STATE events via secure IPC
  if (window.electronAPI?.ipc?.on) {
    window.electronAPI.ipc.on('RESET_STATE', () => {
      store.dispatch(push('/reset'));
    });
  }
}

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
