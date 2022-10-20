import { useState, useEffect } from 'react';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { get } from '../../../utils/lodash-replacements';

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

const edgeExistsInNetwork = (edges, pair, edgeType) => !!getEdgeInNetwork(edges, pair, edgeType);

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
  edgeVariable,
  pair,
  promptIndex,
  stageState,
  deps,
) => {
  // Internal state for if edge exists. True or False
  const [edgeState, setEdgeState] = useState(
    edgeExistsInNetwork(edges, pair, edgeType),
  );

  // Internal state for edge variable value. `value` or null,
  const [edgeValueState, setEdgeValueState] = useState(
    get(getEdgeInNetwork(edges, pair, edgeType), [entityAttributesProperty, edgeVariable], null),
  );

  const [isTouched, setIsTouched] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // Translates edgeState into true/false/null using stageState
  // True: edge exists
  // False: user declined edge (based on stageState)
  // Null: user hasn't decided
  const getHasEdge = () => {
    if (!pair) { return null; }

    // Check if this pair was marked as no before
    if (getIsPreviouslyAnsweredNo(stageState, promptIndex, pair)) {
      return false;
    }

    // If edgeState is false, edge doesn't exist.
    return edgeState === false ? null : edgeState;
  };

  // Return current edgeValue
  const getEdgeValue = () => {
    if (!pair) { return null; }

    return edgeValueState;
  };

  // Update edge value
  // False for user denying edge
  // any value for setting edge variable value
  const setEdge = (value) => {
    if (!pair) { return; }
    // Determine what we need to do:

    // If truthy value and edge exists, we are changing an edge
    const changeEdge = value !== false
      && edgeExistsInNetwork(edges, pair, edgeType)
      && value !== get(
        getEdgeInNetwork(edges, pair, edgeType), [entityAttributesProperty, edgeVariable],
      );

    // If truthy value but no existing edge, adding an edge
    const addEdge = value !== false && !edgeExistsInNetwork(edges, pair, edgeType);

    // If value is false and edge exists, removing an edge
    const removeEdge = value === false && edgeExistsInNetwork(edges, pair, edgeType);

    const existingEdgeID = get(getEdgeInNetwork(edges, pair, edgeType), entityPrimaryKeyProperty);

    if (changeEdge) {
      dispatch(sessionsActions.updateEdge(existingEdgeID, {}, { [edgeVariable]: value }));
    } else if (addEdge) {
      dispatch(sessionsActions.addEdge(
        { from: pair[0], to: pair[1], type: edgeType },
        { [edgeVariable]: value },
      ));
    } else if (removeEdge) {
      dispatch(sessionsActions.removeEdge(existingEdgeID));
    }

    // We set our internal state to update the return value of the hook
    // The interface will update before transitioning to the next step
    setEdgeState(value !== false); // Ensure edgeState is true or false
    setEdgeValueState(value); // Store the actual value in the internal edgeValue state
    setIsChanged(getHasEdge() !== value); // Set changed if we have a new value
    setIsTouched(true);

    // Update our private stage state
    const newStageState = stageStateReducer(stageState, { pair, prompt: promptIndex, value });
    dispatch(sessionsActions.updateStageState(newStageState));
  };

  // we're only going to reset manually (when deps change), because
  // we are internally keeping track of the edge state.
  useEffect(() => {
    setEdgeState(edgeExistsInNetwork(edges, pair, edgeType));
    setEdgeValueState(get(getEdgeInNetwork(
      edges,
      pair,
      edgeType,
    ), [entityAttributesProperty, edgeVariable], null));
    setIsTouched(false);
    setIsChanged(false);
  }, deps);

  return [getHasEdge(), getEdgeValue(), setEdge, isTouched, isChanged];
};

export default useEdgeState;
