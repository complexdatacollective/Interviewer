const DRAG_START = 'DRAG_START';
const DRAG_STOP = 'DRAG_STOP';

const initialState = {
  isDragging: false,
  draggableType: '',
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DRAG_START:
      return {
        ...state,
        isDragging: true,
        draggableType: action.draggableType,
      };
    case DRAG_STOP:
      return {
        ...state,
        isDragging: false,
        draggableType: '',
      };
    default:
      return state;
  }
}

function dragStart(draggableType) {
  return {
    type: DRAG_START,
    draggableType,
  };
}

function dragStop() {
  return {
    type: DRAG_STOP,
  };
}

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
