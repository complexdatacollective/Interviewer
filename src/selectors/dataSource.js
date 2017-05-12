/* eslint-disable no-shadow */
import { createSelector } from 'reselect';
import { join, difference } from '../utils/Network';
import { restOfNetwork, activeStageNetwork } from './network';

const data = state => state.protocol.protocolConfig.data;

const source = (_, props) => props.source;

const filter = (_, props) => props.filter;

const fromSource = createSelector(
  data,
  source,
  (data, source) => data[source],
);

export const dataSource = createSelector(
  source,
  fromSource,
  restOfNetwork,
  activeStageNetwork,
  (source, fromSource, restOfNetwork, activeStageNetwork) => {
    switch (source) {
      case 'existing':
        // that aren't on this stage, but have the same type
        return restOfNetwork;
      default:
        // that aren't on this screen.
        return difference(
          fromSource,
          join(restOfNetwork, activeStageNetwork),
        );
    }
  },
);

export const filteredDataSource = createSelector(
  dataSource,
  filter,
  (dataSource, filter) => filter(dataSource),
);
