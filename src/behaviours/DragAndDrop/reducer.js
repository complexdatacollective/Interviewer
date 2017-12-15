import { filter, reject, omit, uniqBy, isEmpty, thru } from 'lodash';
import { compose } from 'redux';

const UPDATE_TARGET = Symbol('DRAG_AND_DROP/UPDATE_TARGET');
const RENAME_TARGET = Symbol('DRAG_AND_DROP/RENAME_TARGET');
const REMOVE_TARGET = Symbol('DRAG_AND_DROP/REMOVE_TARGET');
const DRAG_START = Symbol('DRAG_AND_DROP/DRAG_START');
const DRAG_MOVE = Symbol('DRAG_AND_DROP/DRAG_MOVE');
const DRAG_END = Symbol('DRAG_AND_DROP/DRAG_END');

const initialState = {
  targets: [],
  source: null,
};

const willAccept = (accepts, source) => {
  try {
    return accepts(source);
  } catch (e) {
    console.log('Error in accept() function', e, source); // eslint-disable-line no-console
    return false;
  }
};

const markTargetHit = ({ target, source }) => {
  if (!source) { return { ...target, isOver: false, willAccept: false }; }

  const isOver = (
    source.x > target.x &&
    source.x < target.x + target.width &&
    source.y > target.y &&
    source.y < target.y + target.height
  );

  return { ...target, isOver, willAccept: willAccept(target.accepts, source) };
};

const markTargetHits = ({ targets, source, ...rest }) => ({
  targets: targets.map(target => markTargetHit({ target, source })),
  source,
  ...rest,
});

const markSourceHit = ({ targets, source, ...rest }) => ({
  targets,
  source: thru(source, (s) => {
    if (isEmpty(s)) { return s; }

    return {
      ...s,
      isOver: filter(targets, 'isOver').length > 0,
    };
  }),
  ...rest,
});

const resetHits = ({ targets, ...rest }) => ({
  targets: targets.map(target => omit(target, ['isOver', 'willAccept'])),
  ...rest,
});

const markHits = compose(markSourceHit, markTargetHits);

const triggerDrag = (state, source) => {
  const hits = markHits({
    ...state,
    source: {
      ...state.source,
      ...source,
    },
  });

  filter(hits.targets, { isOver: true, willAccept: true })
    .forEach((target) => {
      target.onDrag(hits.source);
    });
};

const triggerDrop = (state, source) => {
  const hits = markHits({
    ...state,
    source: {
      ...state.source,
      ...source,
    },
  });

  filter(hits.targets, { isOver: true, willAccept: true })
    .forEach((target) => {
      target.onDrop(hits.source);
    });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_TARGET:
      return markHits({
        ...state,
        targets: uniqBy([action.target, ...state.targets], 'id'),
      });
    case RENAME_TARGET:
      return {
        ...state,
        targets: state.targets.map((target) => {
          if (action.from !== target.id) { return target; }

          return {
            ...target,
            id: action.to,
          };
        }),
      };
    case REMOVE_TARGET:
      return {
        ...state,
        targets: reject(state.targets, ['id', action.id]),
      };
    case DRAG_START: {
      return markHits({
        ...state,
        source: action.source,
      });
    }
    case DRAG_MOVE:
      return markHits({
        ...state,
        source: {
          ...state.source,
          ...action.source,
        },
      });
    case DRAG_END:
      return resetHits({
        ...state,
        source: null,
      });
    default:
      return state;
  }
};

function updateTarget(data) {
  return {
    type: UPDATE_TARGET,
    target: data,
  };
}

function renameTarget({ from, to }) {
  return {
    type: RENAME_TARGET,
    from,
    to,
  };
}

function removeTarget(id) {
  return {
    type: REMOVE_TARGET,
    id,
  };
}

function dragStart(data) {
  return {
    type: DRAG_START,
    source: data,
  };
}

function dragMove(data) {
  return (dispatch, getState) => {
    triggerDrag(getState(), data);

    dispatch({
      type: DRAG_MOVE,
      source: data,
    });
  };
}

function dragEnd(data) {
  return (dispatch, getState) => {
    triggerDrop(getState(), data);

    dispatch({
      type: DRAG_END,
    });
  };
}


const actionCreators = {
  updateTarget,
  renameTarget,
  removeTarget,
  dragStart,
  dragMove,
  dragEnd,
};

const actionTypes = {
  UPDATE_TARGET,
  RENAME_TARGET,
  REMOVE_TARGET,
  DRAG_START,
  DRAG_MOVE,
  DRAG_END,
};

export {
  actionCreators,
  actionTypes,
  reducer,
};

export default reducer;
