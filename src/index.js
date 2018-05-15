import React from 'react';
import ReactDOM from 'react-dom';
import libsodium from 'libsodium-wrappers';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';

import { history, store } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/device';
import App from './containers/App';
import deviceDescription from './utils/DeviceInfo';
import { isCordova } from './utils/Environment';
import AppRouter from './routes';

const startApp = () => {
  const deviceDesc = deviceDescription();
  store.dispatch(deviceActions.setDescription(deviceDesc));

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

libsodium.ready.then(() => {
  if (isCordova()) {
    document.addEventListener('deviceready', startApp, false);
  } else {
    startApp();
  }
});
