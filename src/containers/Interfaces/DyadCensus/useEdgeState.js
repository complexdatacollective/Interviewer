import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';

// TODO: This can just redux actions now

const getEdgeInNetwork = (edges, pair, edgeType) => {
  const [a, b] = pair;

  const edge = edges.find(({ from, to, type }) => (
    type === edgeType &&
    ((from === a && to === b) || (to === b && from === a))
  ));

  if (!edge) { return null; }

  return edge;
};

const useEdgeState = (
  dispatch,
  edges,
  edgeType,
  pair,
  step,
  progress,
) => {
  const [edgeState, setEdgeState] = useState(
    getEdgeInNetwork(edges, pair, edgeType),
  );

  const [isTouched, setIsTouched] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const getHasEdge = () => {
    // Either we set a value for this or it already has an edge
    if (edgeState !== null) { return !!edgeState; }

    // If we've visited this step previously (progress), and no edge exists consider
    // this an implicit 'no'
    if (progress > step) {
      return false;
    }

    // Otherwise consider this blank
    return null;
  };

  const setEdge = (hasEdge = true) => {
    const existingEdge = getEdgeInNetwork(edges, pair, edgeType);

    setEdgeState(hasEdge);
    setIsChanged(getHasEdge() !== hasEdge);
    setIsTouched(true);

    if (hasEdge) {
      if (!existingEdge) {
        dispatch(sessionsActions.addEdge({ from: pair[0], to: pair[1], type: edgeType }));
      }
    } else {
      if (!existingEdge) { return; }
      dispatch(sessionsActions.removeEdge(existingEdge[entityPrimaryKeyProperty]));
    }
  };

  // we're only going to reset manually (when deps change), because
  // we are internally keeping track of the edge state.
  useEffect(() => {
    setEdgeState(getEdgeInNetwork(edges, pair, edgeType));
    setIsTouched(false);
    setIsChanged(false);
  }, [step]);

  return [getHasEdge(), setEdge, isTouched, isChanged];
};

export default useEdgeState;
