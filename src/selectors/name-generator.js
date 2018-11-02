/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { has } from 'lodash';
import { makeGetSubject, makeGetIds, makeGetSubjectType, makeGetAdditionalAttributes } from './interface';
import { nodeAttributesProperty } from '../ducks/modules/network';
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

// Static props that will be added to any created/edited node on the prompt
// Any protocol-specific props will exist in the [nodeAttributesProperty] object
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
      [nodeAttributesProperty]: {
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


export const getInitialSortOrder = createSelector(
  propSortOptions,
  sortOptions => (has(sortOptions, 'sortOrder') ? sortOptions.sortOrder : []),
);

export const getDataByPrompt = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key].nodes,
);

export const makeGetNodeIconName = () => createSelector(
  protocolRegistry,
  makeGetSubjectType(),
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
