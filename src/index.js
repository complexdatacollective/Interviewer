/* eslint-disable */

import React from 'react';
import ReactDOM from 'react-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { ready as secureCommsReady } from 'secure-comms-api/cipher';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import initFileOpener from './utils/initFileOpener';
import { history, store, persistor } from './ducks/store';
import { actionCreators } from './ducks/modules/deviceSettings';
import { Spinner } from './ui/components';
import App from './containers/App';
import { isCordova, isElectron } from './utils/Environment';
import AppRouter from './routes';

// This prevents user from being able to drop a file anywhere on the app
document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

const startApp = () => {
  store.dispatch(actionCreators.deviceReady());

  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={<Spinner />} persistor={persistor}>
        <ConnectedRouter history={history}>
          <App>
            <AppRouter />
          </App>
        </ConnectedRouter>
      </PersistGate>
    </Provider>,
    document.getElementById('root'),
  );
};

if (isElectron()) {
  const { webFrame } = require('electron'); // eslint-disable-line global-require
  webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
  webFrame.registerURLSchemeAsPrivileged('asset');
}

function setupOpenwith() {
  function initSuccess() { console.log('init success!'); }
  function initError(err) { console.log('init failed: ', err); }

  // Increase verbosity if you need more logs
  // cordova.openwith.setVerbosity(cordova.openwith.DEBUG);

  // Initialize the plugin
  window.cordova.openwith.init(initSuccess, initError);

  function myHandler(intent) {
    console.log('intent received');

    console.log('action: ', intent.action); // type of action requested by the user
    console.log('exit: ', intent.exit); // if true, you should exit the app after processing

    for (let i = 0; i < intent.items.length; ++i) {
      const item = intent.items[i];
      console.log('  type: ', item.type); // mime type
      console.log('  uri:  ', item.uri); // uri to the file, probably NOT a web uri

      // some optional additional info
      console.log('  text: ', item.text); // text to share alongside the item, iOS only
      console.log('  name: ', item.name); // suggested name of the image, iOS 11+ only
      console.log('  utis: ', item.utis);
      console.log('  path: ', item.path); // path on the device, generally undefined
    }
  }

  // Define your file handler
  window.cordova.openwith.addHandler(myHandler);
}

secureCommsReady.then(() => {
  if (isCordova()) {
    document.addEventListener('deviceready', () => { startApp(); setupOpenwith(); }, false);
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
