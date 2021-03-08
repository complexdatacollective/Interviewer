/* eslint-disable import/prefer-default-export */
import Fuse from 'fuse.js';
import { get } from 'lodash';
import { createSelector } from 'reselect';

const getSearchOpts = (_, props) => props.options;
const getSearchData = (_, props) => get(props.externalData, 'nodes', []);

/**
 * Fuse.js is an interface for (optionally) fuzzy searching
 */
export const makeGetFuse = (fuseOpts) => createSelector(
  getSearchData,
  getSearchOpts,
  (searchData = [], searchOpts = {}) => {
    let threshold = searchOpts.fuzziness;
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
