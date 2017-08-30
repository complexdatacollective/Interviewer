/* eslint-disable import/prefer-default-export */

import { omit } from 'lodash';
import { store } from '../ducks/store';
import { actionCreators as networkActions } from '../ducks/modules/network';

export const resetPropertyForAllNodes = (property) => {
  const state = store.getState();

  state.network.nodes.forEach((node) => {
    store.dispatch(networkActions.updateNode(omit(node, property)));
  });
};

export const resetEdgesOfType = (edgeType) => {
  const state = store.getState();

  state.network.edges.forEach((edge) => {
    if (edge.type === edgeType) {
      store.dispatch(networkActions.removeEdge(edge));
    }
  });
};
