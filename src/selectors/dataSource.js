import { createSelector } from 'reselect'

import { existingNetwork } from './network'

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
  existingNetwork,
  (source, fromSource, existingNetwork) => {
    switch (source) {
      case 'existing':
        return existingNetwork;
      default:
        return fromSource;
    }
  }
);

export const filteredDataSource = createSelector(
  dataSource,
  filter,
  (dataSource, filter) => {
    return filter(dataSource)
  }
);
