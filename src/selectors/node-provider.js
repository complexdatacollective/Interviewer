/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { differenceBy } from 'lodash';
import { networkNodes, makeNetworkNodesForOtherPrompts } from './interface';
import { getExternalData } from './protocol';

const propDataSource = (_, props) => props.dataSource;

const makeGetDataSource = () =>
  createSelector(
    propDataSource,
    dataSource => dataSource,
  );

export const makeGetProviderNodes = () => {
  const networkNodesForOtherPrompts = makeNetworkNodesForOtherPrompts();
  const getDataSource = makeGetDataSource();

  return createSelector(
    getDataSource,
    networkNodes,
    networkNodesForOtherPrompts,
    getExternalData,
    (dataSource, nodes, existingNodes, externalData) =>
      (dataSource === 'existing' ? existingNodes : differenceBy(externalData[dataSource].nodes, nodes, 'uid')),
  );
};
