import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Spinner } from '@codaco/ui';
import { store } from './ducks/store';
import { actionCreators as deviceActions } from './ducks/modules/deviceSettings';
import App from './containers/App';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
// import remote from './utils/remote';

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
  store.dispatch(deviceActions.deviceReady());

  ReactDOM.render(
    <Provider store={store}>
      <App>
        <RouterProvider router={router} fallbackElement={<Spinner />} />
      </App>
    </Provider>,
    document.getElementById('root'),
  );
};

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    startApp();
  }
}
