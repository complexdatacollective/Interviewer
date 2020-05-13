import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../../../ducks/modules/network';

const useEdgeState = (
  edgeType,
  { dispatch },
  deps,
) => {
  const [hasEdge, setHasEdge] = useState(null);

  const updateNetwork = (pair, edge = {}) => {
    if (hasEdge) {
      dispatch(sessionsActions.addEdge({ from: pair[0], to: pair[1], type: edgeType }));
    } else {
      if (!edge) { return; }

      dispatch(sessionsActions.removeEdge(edge[entityPrimaryKeyProperty]));
    }
  };

  useEffect(() => {
    setHasEdge(null);
  }, deps);

  return [hasEdge, setHasEdge, updateNetwork];
};

export default useEdgeState;
