const ADD_SERVER = 'ADD_SERVER';

const initialState = {
  paired: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_SERVER:
      return { ...state, paired: [...state.paired, action.server] };
    default:
      return state;
  }
}

const addServer = server => ({
  type: ADD_SERVER,
  server,
});

const actionCreators = {
  addServer,
};

const actionTypes = {
  ADD_SERVER,
};

export {
  actionCreators,
  actionTypes,
};
