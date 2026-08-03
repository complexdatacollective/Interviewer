import { createSelector } from 'reselect';

import { getQuery } from '@codaco/network-query';

import { SkipLogicAction } from '../protocol-consts';
import { adaptFilter } from '../utils/networkQueryFilter';
import { getNetwork } from './network';
import { getProtocolStages } from './protocol';

const rotateIndex = (max, nextIndex) => (nextIndex + max) % max;
const maxLength = (state) => getProtocolStages(state).length;

export const getNextIndex = (index) =>
  createSelector(maxLength, (max) => rotateIndex(max, index));

const getSkipLogic = (index) =>
  createSelector(getProtocolStages, (stages) => stages?.[index]?.skipLogic);

/**
 * @returns {boolean} true for skip (when query matches), false for show (when query matches)
 */
const isSkipAction = (index) =>
  createSelector(
    getSkipLogic(index),
    (logic) => logic && logic.action === SkipLogicAction.SKIP,
  );

const formatQueryParameters = (params) => ({
  rules: [],
  join: null,
  ...params,
});

export const isStageSkipped = (index) =>
  createSelector(
    getSkipLogic(index),
    isSkipAction(index),
    getNetwork,
    (logic, skipOnMatch, network) => {
      if (!logic) {
        return false;
      }

      // Handle skipLogic with no rules defined differently depending on action.
      // skipLogic.action === SHOW <- always show the stage
      // skipLogic.action === SKIP <- always skip the stage
      // Allows for a quick way to disable a stage by setting SKIP if, and then
      // not defining rules.
      // Should be changed with https://github.com/complexdatacollective/Architect/issues/517
      if (!logic.filter.rules || !logic.filter.rules.length === 0) {
        return !!skipOnMatch;
      }

      const queryParameters = formatQueryParameters(adaptFilter(logic.filter));
      const result = getQuery(queryParameters)(network);
      const isSkipped = (skipOnMatch && result) || (!skipOnMatch && !result);

      return isSkipped;
    },
  );
