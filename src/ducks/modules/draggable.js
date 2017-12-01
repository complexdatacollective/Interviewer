const DRAG_START = 'DRAG_START';
const DRAG_STOP = 'DRAG_STOP';

const initialState = {
  isDragging: false,
  draggableType: '',
  meta: {},
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case DRAG_START:
      return {
        ...state,
        isDragging: true,
        draggableType: action.draggableType,
        meta: action.meta,
      };
    case DRAG_STOP:
      return {
        ...state,
        isDragging: false,
        draggableType: '',
        meta: {},
      };
    default:
      return state;
  }
}

function dragStart(draggableType, meta) {
  return {
    type: DRAG_START,
    draggableType,
    meta,
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
