import { filter, reject, omit, uniqBy, throttle, isEmpty, tap } from 'lodash';
import { compose } from 'redux';

const UPDATE_TARGET = Symbol('DRAG_AND_DROP/UPDATE_TARGET');
const RENAME_TARGET = Symbol('DRAG_AND_DROP/RENAME_TARGET');
const REMOVE_TARGET = Symbol('DRAG_AND_DROP/REMOVE_TARGET');
const UPDATE_SOURCE = Symbol('DRAG_AND_DROP/UPDATE_SOURCE');
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
    console.log('Error in accept() function', e, source);
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
  source: tap(source, (source) => {
    if (isEmpty(source)) { return source; }

    return {
      ...source,
      isOver: filter(targets, 'isOver').length > 0,
    };
  }),
  ...rest,
});

const resetHits = ({ targets, source, ...rest }) => ({
  targets: targets.map(target => omit(target, ['isOver', 'willAccept'])),
  ...rest,
});

const markHits = compose(markSourceHit, markTargetHits);

const reducer = (state = initialState, { type, ...action }) => {
  switch (type) {
    case UPDATE_TARGET:
      return markHits({
        ...state,
        targets: uniqBy([action, ...state.targets], 'id'),
      });
    case RENAME_TARGET:
      return {
        ...state,
        targets: state.targets.map((target) => {
          if (action.from !== target.id ) { return target; }

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
        source: action,
      });
    }
    case DRAG_MOVE:
      return markHits({
        ...state,
        source: {
          ...state.source,
          ...action,
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
    ...data,
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
    ...data,
  };
}

function dragMove(data) {
  return (dispatch, getState) => {
    triggerDrag(getState(), data);

    dispatch({
      type: DRAG_MOVE,
      ...data,
    });
  }
}

function dragEnd(data) {
  return (dispatch, getState) => {
    triggerDrop(getState(), data);

    dispatch({
      type: DRAG_END,
      ...data,
    });
  }
}

const triggerDrag = (state, action) => {
  const hits = markHits({
    ...state,
    source: {
      ...state.source,
      ...action,
    },
  });

  filter(hits.targets, { isOver: true, willAccept: true })
    .forEach((target) => {
      target.onDrag(hits.source);
    });
};

const triggerDrop = (state, action) => {
  const hits = markHits({
    ...state,
    source: {
      ...state.source,
      ...action,
    },
  });

  filter(hits.targets, { isOver: true, willAccept: true })
    .forEach((target) => {
      target.onDrop(hits.source);
    });
};

const actionCreators = {
  updateTarget,
  renameTarget,
  removeTarget,
  dragStart,
  dragMove: throttle(dragMove, 1000/16),
  dragEnd,
};

const actionTypes = {
};

export {
  actionCreators,
  actionTypes,
  reducer,
};

export default reducer;
