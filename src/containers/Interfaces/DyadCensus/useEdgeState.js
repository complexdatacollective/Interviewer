import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

export const getEdgeInNetwork = (edges, pair, edgeType) => {
  if (!pair) { return null; }
  const [a, b] = pair;

  const edge = edges.find(({ from, to, type }) => (
    type === edgeType
    && ((from === a && to === b) || (to === a && from === b))
  ));

  if (!edge) { return null; }

  return edge;
};

export const matchEntry = (prompt, pair) => ([p, a, b]) => (
  (p === prompt && a === pair[0] && b === pair[1])
  || (p === prompt && b === pair[0] && a === pair[1])
);

export const getIsPreviouslyAnsweredNo = (state, prompt, pair) => {
  if (!state || pair.length !== 2) { return false; }

  const answer = state
    .find(matchEntry(prompt, pair));

  if (answer && answer[3] === false) {
    return true;
  }

  return false;
};

export const stageStateReducer = (state = [], { pair, prompt, value }) => {
  // Remove existing entry, if it exists, and add new one on the end
  const newState = [
    ...state.filter((item) => !matchEntry(prompt, pair)(item)),
    [prompt, ...pair, value],
  ];

  return newState;
};

/**
 * Manages a virtual edge state between the current pair,
 * taking into account where we are in the stage, and the
 * actual state of the edge in the network.
 *
 * The latest Redux version would allow the removal of
 * dispatch, and the passed in state (edges, edgeType, stageState).
 *
 * @param {function} dispatch - Redux dispatcher
 * @param {array} edges - List of all the edges relevant to this stage
 * @param {string} edgeType - Type of edge relevant to this prompt
 * @param {array} pair - Pair of node ids in format `[a, b]`
 * @param {boolean} stageState - Tracked choices in redux state
 * @param {array} deps - If these deps are changed, reset
 */
const useEdgeState = (
  dispatch,
  edges,
  edgeType,
  pair,
  promptIndex,
  stageState,
  deps,
) => {
  const [edgeState, setEdgeState] = useState(
    getEdgeInNetwork(edges, pair, edgeType),
  );

  const [isTouched, setIsTouched] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const getHasEdge = () => {
    if (!pair) { return null; }

    // Either we set a value for this or it already has an edge
    if (edgeState !== null) { return !!edgeState; }

    // Check if this pair was marked as no before
    if (getIsPreviouslyAnsweredNo(stageState, promptIndex, pair)) {
      return false;
    }

    // Otherwise consider this blank
    return null;
  };

  const setEdge = (value = true) => {
    if (!pair) { return; }

    const existingEdge = getEdgeInNetwork(edges, pair, edgeType);

    setEdgeState(value);
    setIsChanged(getHasEdge() !== value);
    setIsTouched(true);

    const addEdge = value && !existingEdge;
    const removeEdge = !value && existingEdge;

    const newStageState = stageStateReducer(stageState, { pair, prompt: promptIndex, value });

    if (addEdge) {
      dispatch(sessionsActions.addEdge({ from: pair[0], to: pair[1], type: edgeType }));
    } else if (removeEdge) {
      dispatch(sessionsActions.removeEdge(existingEdge[entityPrimaryKeyProperty]));
    }

    dispatch(sessionsActions.updateStageState(newStageState));
  };

  // we're only going to reset manually (when deps change), because
  // we are internally keeping track of the edge state.
  useEffect(() => {
    setEdgeState(getEdgeInNetwork(edges, pair, edgeType));
    setIsTouched(false);
    setIsChanged(false);
  }, deps);

  return [getHasEdge(), setEdge, isTouched, isChanged];
};

export default useEdgeState;
