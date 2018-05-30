const ADD_PROTOCOL = 'ADD_PROTOCOL';

const initialState = [
  {
    name: 'Education Protocol',
    version: '4.0.0',
    description: 'This is the education protocol.',
    type: 'factory',
    path: 'education.netcanvas',
  },
  {
    name: 'Development Protocol',
    version: '4.0.0',
    description: 'This is the development protocol.',
    type: 'factory',
    path: 'development.netcanvas',
  },
];

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ADD_PROTOCOL:
      return [
        ...state,
        action.protocol,
      ];
    default:
      return state;
  }
}

function addProtocol(protocol) {
  return {
    type: ADD_PROTOCOL,
    protocol,
  };
}

const actionCreators = {
  addProtocol,
};

const actionTypes = {
  ADD_PROTOCOL,
};

export {
  actionCreators,
  actionTypes,
};
