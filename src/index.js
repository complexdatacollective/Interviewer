/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ready as secureCommsReady } from 'secure-comms-api/cipher';
import { Provider } from 'react-redux';
import { ConnectedRouter, push } from 'react-router-redux';
import { Spinner } from '@codaco/ui';
import initFileOpener from './utils/initFileOpener';
import { history, store, persistor } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
import { actionCreators as updateActions } from './ducks/modules/update';
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

  if (isCordova()) {
    // This method let's the codepush plugin know that an update succeeded
    codePush.notifyApplicationReady();

    const onError = (error) => {
      store.dispatch(updateActions.setUpdateError(error))
    };

    codePush.checkForUpdate((remotePackage) => {
        if (!remotePackage) {
          store.dispatch(updateActions.setUpdateUnavailable());
          return;
        }

        if (remotePackage.failedInstall) {
          store.dispatch(updateActions.setUpdateError('thingy'));
          return;
        }

        if (store.getState().sessions.length > 0) {
          store.dispatch(updateActions.setUpdateBlocked());
          return;
        }

        remotePackage.download((localPackage) => {
          localPackage.install(() => {
            store.dispatch(updateActions.setUpdatePending());
          }, onError);
        }, onError);
    }, onError);

    setTimeout(() => {
      store.dispatch(updateActions.setUpdateBlocked());
    }, 8000);

    setTimeout(() => {
      store.dispatch(updateActions.setUpdatePending());
    }, 5000);

    setTimeout(() => {
      store.dispatch(updateActions.setUpdateError('thingy'));
    }, 2000);
  }

  if (isElectron()) {
    const { ipcRenderer} = requre('electron');

    ipcRenderer.on('RESET_STATE', () => {
      store.dispatch(push('/reset'));
    });

    ipcRenderer.on('UPDATE_AVAILABLE', () => {
      if (store.getState().sessions.length > 0) {
        store.dispatch(updateActions.setUpdateBlocked());
      }

      ipcRenderer.send('download-update');
    });

    ipcRenderer.on('UPDATE_PENDING', () => {
      store.dispatch(updateActions.setUpdatePending());
    });

    ipcRenderer.on('UPDATE_UNAVAILABLE', () => {
      store.dispatch(updateActions.setUpdateUnavailable());
    });

    ipcRenderer.on('UPDATE_ERROR', (detail) => {
      console.log('got update availalble');
      store.dispatch(updateActions.setUpdateError(detail));
    });

    // Tell the update process to check for updates
    ipcRenderer.send('check-for-updates');
  }

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
  const { webFrame, ipcRenderer } = window.require('electron'); // eslint-disable-line global-require
  webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
  remote.init();
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
