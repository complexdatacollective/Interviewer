const DRAG_START = 'DRAG_START';
const DRAG_STOP = 'DRAG_STOP';

const initialState = {
  isDragging: false,
  draggableType: '',
  draggingFromIds: {},
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DRAG_START:
      return {
        ...state,
        isDragging: true,
        draggableType: action.draggableType,
        draggingFromIds: action.draggingFromIds,
      };
    case DRAG_STOP:
      return {
        ...state,
        isDragging: false,
        draggableType: '',
        draggingFromIds: {},
      };
    default:
      return state;
  }
}

function dragStart(draggableType, draggingFromIds) {
  return {
    type: DRAG_START,
    draggableType,
    draggingFromIds,
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
