import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import initReactFastclick from 'react-fastclick';
import { Provider } from 'react-redux';
import { store } from './ducks/store';
import { actionCreators as mockActions } from './ducks/modules/mock';
import App from './containers/App';
import AppRouter from './routes';
import { isCordova } from './utils/Environment';

window.populateNodes = (howMany = 0) => {
  store.dispatch(mockActions.generateNodes(howMany));
};

injectTapEventPlugin();
initReactFastclick();

const startApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App>
        <AppRouter />
      </App>
    </Provider>,
    document.getElementById('root'),
  );
};

if (isCordova()) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}
