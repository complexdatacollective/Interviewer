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
  edges,
  pair,
  edgeType,
  { dispatch },
  deps,
) => {
  const [edgeState, setEdgeState] = useState(
    getEdgeInNetwork(edges, pair, edgeType),
  );

  const [isTouched, setIsTouched] = useState(false);

  const setEdge = (hasEdge = true) => {
    const edge = getEdgeInNetwork(edges, pair, edgeType);

    setEdgeState(hasEdge);
    setIsTouched(true);

    if (hasEdge) {
      if (!edge) {
        dispatch(sessionsActions.addEdge({ from: pair[0], to: pair[1], type: edgeType }));
      }
    } else {
      if (!edge) { return; }
      dispatch(sessionsActions.removeEdge(edge[entityPrimaryKeyProperty]));
    }
  };

  // we're only going to reset manually (when deps change), because
  // we are internally keeping track of the edge state.
  useEffect(() => {
    setEdgeState(getEdgeInNetwork(edges, pair, edgeType));
    setIsTouched(false);
  }, [...deps]);

  return [edgeState, setEdge, isTouched];
};

export default useEdgeState;
