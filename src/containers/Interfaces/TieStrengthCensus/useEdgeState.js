import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';
import { get } from 'lodash';
import { entityAttributesProperty } from '../../../utils/network-exporters/src/utils/reservedAttributes';

const getEdgeInNetwork = (edges, pair, edgeType) => {
  if (!pair) { return null; }
  const [a, b] = pair;

  const edge = edges.find(({ from, to, type }) => (
    type === edgeType
    && ((from === a && to === b) || (to === b && from === a))
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
 * @param {string} edgeState - Type of edge relevant to this prompt
 * @param {array} pair - Pair of node ids in format `[a, b]`
 * @param {boolean} stageState - Tracked choices in redux state
 * @param {array} deps - If these deps are changed, reset
 */
const useEdgeState = (
  dispatch,
  edges,
  edgeType,
  edgeVariable,
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

  // Return null if there is no edge, or false if previously answered no
  // ...otherwise return edgeVariable value
  const getHasEdge = () => {
    if (!pair) { return null; }

    // edgeState not null means edge exists and may have a value
    if (edgeState !== null) { return !!edgeState; }

    // Check if this pair was marked as no before
    if (getIsPreviouslyAnsweredNo(stageState, promptIndex, pair)) {
      return false;
    }

    // Otherwise consider this blank
    return null;
  };

  const getEdgeValue = () => {
    console.log('getEdgeValue');
    if (!pair || !getHasEdge()) { return null; }

    return get(edgeState, [entityAttributesProperty, edgeVariable], null);

  }

  const setEdge = (value = true) => {
    if (!pair) { return; }

    const existingEdge = getEdgeInNetwork(edges, pair, edgeType);
    console.log('set edge', value, existingEdge);

    const isChanged = existingEdge && existingEdge[entityAttributesProperty][edgeVariable] !== value;
    setIsChanged(isChanged);
    setIsTouched(true);

    const addEdge = value && !existingEdge;
    const removeEdge = !value && existingEdge;

    const newStageState = stageStateReducer(stageState, { pair, prompt: promptIndex, value });

    if (isChanged) { // If changed, update edge variable value
      console.log('isChanged', value);
      dispatch(sessionsActions.updateEdge(existingEdge[entityPrimaryKeyProperty], {}, {
        [edgeVariable]: value,
      }));
    } else if (addEdge) { // If addEdge, create an edge with the variable value
      console.log('addEdge', value);
      dispatch(sessionsActions.addEdge({
        from: pair[0],
        to: pair[1],
        type: edgeType,
      }, {
        [edgeVariable]: value,
      }));
    } else if (removeEdge) { // If removeEdge, remove the edge
      console.log('removeEdge', value);
      dispatch(sessionsActions.removeEdge(existingEdge[entityPrimaryKeyProperty]));
    }

    console.log('newStageStage', newStageState);
    dispatch(sessionsActions.updateStageState(newStageState));
  };

  // we're only going to reset manually (when deps change), because
  // we are internally keeping track of the edge state.
  useEffect(() => {
    console.log('useeffect');
    setEdgeState(getEdgeInNetwork(edges, pair, edgeType));
    setIsTouched(false);
    setIsChanged(false);
  }, deps);

  return [getHasEdge(), setEdge, getEdgeValue(),isTouched, isChanged];
};

export default useEdgeState;
