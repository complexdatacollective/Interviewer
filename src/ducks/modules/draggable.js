const DRAG_START = 'DRAG_START';
const DRAG_STOP = 'DRAG_STOP';

const initialState = {
  isDragging: false,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
      case DRAG_START:
        return {
          ...state,
          isDragging: true,
        }
        case DRAG_STOP:
          return {
            ...state,
            isDragging: false,
          }
    default:
      return state;
  }
};

function dragStart() {
  return {
    type: DRAG_START,
  }
};

function dragStop() {
  return {
    type: DRAG_STOP,
  }
};

const actionCreators = {
  dragStart,
  dragStop,
};

const actionTypes = {
  DRAG_START,
  DRAG_STOP,
};

export {
  actionCreators,
  actionTypes,
};
