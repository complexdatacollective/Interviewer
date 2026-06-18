/**
 * Main entry point.
 */

import { ConnectedRouter, push } from 'connected-react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import App from './containers/App';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
import { history, store, persistor as storePersistor } from './ducks/store';
import AppRouter from './routes';
import { getEnv, isElectron } from './utils/Environment';
import initFileOpener from './utils/initFileOpener';
import initMenuActions from './utils/initMenuActions';
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

const boot = () => {
  startApp();
  initFileOpener();
};

if (document.readyState === 'complete') {
  boot();
} else {
  document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
      boot();
    }
  };
}
