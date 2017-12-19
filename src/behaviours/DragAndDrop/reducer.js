import { filter, reject, omit, isEmpty, thru } from 'lodash';

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

const defaultSource = {
  meta: {},
};

// Since accepts() is a weak link and can throw errors if not carefully written.
const willAccept = (accepts, source) => {
  try {
    return accepts({
      ...defaultSource,
      ...source,
    });
  } catch (e) {
    console.log('Error in accept() function', e, source); // eslint-disable-line no-console
    return false;
  }
};

const markHitTarget = ({ target, source }) => {
  if (!source) { return { ...target, isOver: false, willAccept: false }; }

  const isOver = (
    source.x > target.x &&
    source.x < target.x + target.width &&
    source.y > target.y &&
    source.y < target.y + target.height
  );

  return { ...target, isOver, willAccept: willAccept(target.accepts, source) };
};

const markHitTargets = ({ targets, source }) =>
  targets.map(target => markHitTarget({ target, source }));

const markHitSource = ({ targets, source }) =>
  thru(source, (s) => {
    if (isEmpty(s)) { return s; }

    return {
      ...s,
      isOver: filter(targets, 'isOver').length > 0,
    };
  });

const markHitAll = ({ targets, source, ...rest }) => {
  const targetsWithHits = markHitTargets({ targets, source });
  const sourceWithHits = markHitSource({ targets: targetsWithHits, source });

  return {
    ...rest,
    targets: targetsWithHits,
    source: sourceWithHits,
  };
};

const resetHits = ({ targets, ...rest }) => ({
  targets: targets.map(target => omit(target, ['isOver', 'willAccept'])),
  ...rest,
});

const triggerDrag = (state, source) => {
  const hits = markHitAll({
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
  const hits = markHitAll({
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
    case UPDATE_TARGET: {
      const targets = [
        ...reject(state.targets, ['id', action.target.id]),
        markHitTarget({ target: action.target, source: state.source }),
      ];

      const source = markHitSource({
        targets,
        source: state.source,
      });

      return {
        ...state,
        targets,
        source,
      };
    }
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
    case REMOVE_TARGET: {
      const targets = reject(state.targets, ['id', action.id]);
      const source = markHitSource({ targets, source: state.source });
      return {
        ...state,
        targets,
        source,
      };
    }
    case DRAG_START: {
      return markHitAll({
        ...state,
        source: action.source,
      });
    }
    case DRAG_MOVE:
      if (state.source === null) { return state; }

      return markHitAll({
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
