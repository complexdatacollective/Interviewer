const SET_DESCRIPTION = 'SET_DESCRIPTION';

const initialState = {};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_DESCRIPTION:
      return { ...state, description: action.description };
    default:
      return state;
  }
}

const setDescription = description => ({
  type: SET_DESCRIPTION,
  description,
});

const actionCreators = {
  setDescription,
};

const actionTypes = {
  SET_DESCRIPTION,
};

export {
  actionCreators,
  actionTypes,
};
