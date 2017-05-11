import { createSelector } from 'reselect'

import { join, difference } from '../utils/Network'
import { restOfNetwork, activeStageNetwork } from './network'

const data = state => state.protocol.protocolConfig.data;

const source = (_, props) => props.source;

const filter = (_, props) => props.filter;

const fromSource = createSelector(
  data,
  source,
  (data, source) => data[source]
)

export const dataSource = createSelector(
  source,
  fromSource,
  restOfNetwork,
  activeStageNetwork,
  (source, fromSource, restOfNetwork, activeStageNetwork) => {
    switch (source) {
      case 'existing':
        return restOfNetwork;  // that aren't on this stage, but have the same type
      default:
        return difference(fromSource, join(restOfNetwork, activeStageNetwork));  // that aren't on this screen.
    }
  }
);

export const filteredDataSource = createSelector(
  dataSource,
  filter,
  (dataSource, filter) => {
    return filter(dataSource);
  }
);
