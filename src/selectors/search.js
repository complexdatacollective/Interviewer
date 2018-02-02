/* eslint-disable import/prefer-default-export */
import Fuse from 'fuse.js';
import { createSelector } from 'reselect';

import { getExternalData } from './protocol';

// The value of this key should point to an attribute in the protocol's externalData.
const getDatasourceKey = (_, props) => props.dataSourceKey;
const getSearchOpts = (_, props) => props.options;
const getSearchData = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key] && externalData[key].nodes,
);

/**
 * Fuse.js is an interface for (optionally) fuzzy searching
 */
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
