/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { has } from 'lodash';
import { makeGetSubject, makeGetIds, makeGetAdditionalAttributes } from './interface';
import { getExternalData, protocolRegistry } from './protocol';
import { nextUid } from '../ducks/modules/network';


// Selectors that are specific to the name generator

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// MemoedSelectors

const getDatasourceKey = (_, props) => props.prompt.dataSource;
const propCardOptions = (_, props) => props.prompt.cardOptions;
const propSortOptions = (_, props) => props.prompt.sortOptions;

export const makeGetNodeType = () => (createSelector(
  makeGetSubject(),
  subject => subject && subject.type,
));

export const makeGetPromptNodeAttributes = () => {
  const getSubject = makeGetSubject();
  const getIds = makeGetIds();
  const getAdditionalAttributes = makeGetAdditionalAttributes();

  return createSelector(
    getSubject,
    getIds,
    getAdditionalAttributes
    ,
    ({ type }, ids, additionalAttributes) => ({
      type,
      ...ids,
      ...additionalAttributes,
    }),
  );
};

export const getCardDisplayLabel = createSelector(
  propCardOptions,
  cardOptions => cardOptions.displayLabel,
);

export const getCardAdditionalProperties = createSelector(
  propCardOptions,
  cardOptions => (has(cardOptions, 'additionalProperties') ? cardOptions.additionalProperties : []),
);

export const getSortFields = createSelector(
  propSortOptions,
  sortOptions => (has(sortOptions, 'sortableProperties') ? sortOptions.sortableProperties : []),
);

export const getSortOrderDefault = createSelector(
  propSortOptions,
  sortOptions => sortOptions.sortOrder && (Object.keys(sortOptions.sortOrder)[0] || ''),
);

export const getSortDirectionDefault = createSelector(
  propSortOptions,
  getSortOrderDefault,
  (sortOptions, key) => sortOptions.sortOrder && (sortOptions.sortOrder[key] || ''),
);

export const getDataByPrompt = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key].nodes.map(
    (node, index) => ({ uid: nextUid(externalData[key].nodes, index), ...node })),
);

export const makeGetNodeIconName = () => createSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].iconVariant;
  },
);
