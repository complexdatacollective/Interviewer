import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './ducks/store';
import { actionCreators as mockActions } from './ducks/modules/mock';
import App from './containers/App';
import AppRouter from './routes';
import { isCordova, isElectron, isMacOS, isWindows, isLinux } from './utils/Environment';

window.populateNodes = (howMany = 0) => {
  store.dispatch(mockActions.generateNodes(howMany));
};

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

console.log(`isCordova: ${isCordova()}`);
console.log(`isElectron: ${isElectron()}`);
console.log(`isMacOS: ${isMacOS()}`);
console.log(`isWindows: ${isWindows()}`);
console.log(`isLinux: ${isLinux()}`);
