import preloadWorkers from '../../utils/protocol/preloadWorkers';
import { supportedWorkers } from '../../utils/WorkerAgent';

const SET_WORKER_MAP = 'SET_WORKER_MAP';
const RESET_WORKER_MAP = 'RESET_WORKER_MAP';

const initialState = null;

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WORKER_MAP:
      return action.map;
    case RESET_WORKER_MAP:
      return initialState;
    default:
      return state;
  }
}

// If there's no custom worker, set to empty so we won't expect one later
function setWorkerMapAction(map = {}) {
  return {
    type: SET_WORKER_MAP,
    map,
  };
}

function resetWorkerMapAction() {
  return {
    type: RESET_WORKER_MAP,
  };
}

const initializeSessionWorkersThunk = (protocolUID) => (dispatch) =>
  preloadWorkers(protocolUID)
    .then((workerUrls) => {
      const map = workerUrls.reduce((urlMap, workerUrl, i) => {
        if (workerUrl) {
          urlMap[supportedWorkers[i]] = workerUrl;
        }
        return urlMap;
      }, {});
      return dispatch(setWorkerMapAction(map));
    })
    .catch((_error) => {});

const actionCreators = {
  setWorkerMapAction,
  resetWorkerMapAction,
  initializeSessionWorkersThunk,
};

export { actionCreators };
