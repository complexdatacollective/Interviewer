/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { has, get } from 'lodash';
import { makeGetSubject, makeGetIds, makeGetNodeType, makeGetAdditionalAttributes } from './interface';
import { NodeAttributesProperty } from '../ducks/modules/network';
import { protocolRegistry } from './protocol';
import { getExternalData } from './externalData';

// Selectors that are specific to the name generator

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

const defaultPanelConfiguration = {
  title: '',
  dataSource: 'existing',
  filter: network => network,
};

// MemoedSelectors

const getDatasourceKey = (_, props) => props.prompt.dataSource;
const propCardOptions = (_, props) => props.prompt.cardOptions;
const propSortOptions = (_, props) => props.prompt.sortOptions;
const propPanels = (_, props) => props.stage.panels;

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
      [NodeAttributesProperty]: {
        ...additionalAttributes,
      },
    }),
  );
};

// Returns the displayLabel property of the card options configuration API
export const getCardDisplayLabel = createSelector(
  propCardOptions,
  cardOptions => cardOptions.displayLabel,
);

// Returns any additional properties to be displayed on cards.
// Returns an empty array if no additional properties are specified in the protocol.
export const getCardAdditionalProperties = createSelector(
  propCardOptions,
  cardOptions => (has(cardOptions, 'additionalProperties') ? cardOptions.additionalProperties : []),
);

// Returns the properties that are specified as sortable in sortOptions
export const getSortableFields = createSelector(
  propSortOptions,
  sortOptions => (has(sortOptions, 'sortableProperties') ? sortOptions.sortableProperties : []),
);


export const getSortOrderDefault = createSelector(
  sortOptions => get(sortOptions, ['sortOrder', 0, 'property'], ''),
);

// TODO: hard coded to select the first sortOrder rule,
// until we add support for multi-property sorting
export const getSortDirectionDefault = createSelector(
  sortOptions => get(sortOptions, ['sortOrder', 0, 'direction'], ''),
);


export const getDataByPrompt = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key].nodes,
);

export const makeGetNodeIconName = () => createSelector(
  protocolRegistry,
  makeGetNodeType(),
  (variableRegistry, nodeType) => {
    const nodeInfo = variableRegistry.node;
    return nodeInfo && nodeInfo[nodeType] && nodeInfo[nodeType].iconVariant;
  },
);

export const makeGetPanelConfiguration = () =>
  createSelector(
    propPanels,
    panels => (panels ? panels.map(panel => ({ ...defaultPanelConfiguration, ...panel })) : []),
  );
