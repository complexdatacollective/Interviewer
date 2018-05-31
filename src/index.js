import React from 'react';
import ReactDOM from 'react-dom';
import libsodium from 'libsodium-wrappers';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import { history, store } from './ducks/store';
import App from './containers/App';
import { isCordova, isElectron } from './utils/Environment';
import AppRouter from './routes';

const startApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App>
          <AppRouter />
        </App>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root'),
  );
};

if (isElectron()) {
  const { webFrame } = require('electron'); // eslint-disable-line global-require
  webFrame.setVisualZoomLevelLimits(1, 1); // Prevents pinch-to-zoom
}

libsodium.ready.then(() => {
  if (isCordova()) {
    document.addEventListener('deviceready', startApp, false);
  } else {
    startApp();
  }
});
