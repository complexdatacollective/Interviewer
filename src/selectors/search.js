/* eslint-disable import/prefer-default-export */
import FuseLegacy from 'fuse.js-legacy';
import { createSelector } from 'reselect';
import { get } from '../utils/lodash-replacements';

const getSearchOpts = (_, props) => props.options;
const getSearchData = (_, props) => get(props.externalData, 'nodes', []);

/**
 * The new NameGeneratorRoster interface upgrades the fuse.js version
 * to 6.x.x. This would modify the behaviour of the existing legacy
 * roster interfaces, so we need to keep this selector for them, which
 * uses the fuse.js-legacy npm alias.
*/
// eslint-disable-next-line camelcase
export const LEGACY_makeGetFuse = (fuseOpts) => createSelector(
  getSearchData,
  getSearchOpts,
  (searchData = [], searchOpts = {}) => {
    let threshold = searchOpts.fuzziness;
    if (typeof threshold !== 'number') {
      threshold = fuseOpts.threshold;
    }
    return new FuseLegacy(searchData, {
      ...fuseOpts,
      keys: searchOpts.matchProperties,
      threshold,
    });
  },
);
