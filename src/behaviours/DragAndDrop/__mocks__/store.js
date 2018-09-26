import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const mockStore = configureStore([thunk]);

export default mockStore({
  obstacles: [],
  targets: [],
  source: null,
});
