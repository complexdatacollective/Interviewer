import { useState, useEffect } from 'react';
import { actionCreators as sessionsActions } from '../../../ducks/modules/sessions';

const useEdgeState = (
  edgeType,
  { dispatch },
  deps,
) => {
  const [hasEdge, setHasEdge] = useState(null);

  const updateNetwork = (pair) => {
    console.log({ pair, hasEdge });
    if (hasEdge) {
      dispatch(sessionsActions.addEdge({ from: pair[0], to: pair[1], type: edgeType }));
    } else {
      dispatch(sessionsActions.removeEdge({ from: pair[0], to: pair[1], type: edgeType }));
    }
  };

  useEffect(() => {
    setHasEdge(null);
  }, deps);

  return [hasEdge, setHasEdge, updateNetwork];
};

export default useEdgeState;
