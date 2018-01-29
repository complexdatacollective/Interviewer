import Fuse from 'fuse.js';
import { createSelector } from 'reselect';

import { getExternalData } from './protocol';

const getDatasourceKey = (_, props) => props.dataSourceKey;
const getSearchOpts = (_, props) => props.options;

/**
 * Look up the search set for a search based on a data source in the protocol.
 * The value of this key should point to an attribute in the protocol's externalData.
 */
export const getSearchData = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key] && externalData[key].nodes,
);

export const makeGetFuse = fuseOpts => createSelector(
  getSearchData,
  getSearchOpts,
  (searchData, searchOpts = {}) => {
    let threshold = searchOpts.fuzzyness;
    if (typeof threshold !== 'number') {
      threshold = fuseOpts.threshold;
    }
    return new Fuse(searchData, {
      ...fuseOpts,
      keys: searchOpts.matchProperties,
      threshold,
    });
  },
);
