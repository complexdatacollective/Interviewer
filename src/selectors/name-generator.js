/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { has, omit } from 'lodash';
import { makeGetSubject, makeGetIds, makeGetAdditionalAttributes } from './interface';
import { getExternalData } from './protocol';

// Selectors that are specific to the name generator

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// MemoedSelectors

const getDatasourceKey = (_, props) => props.prompt.dataSource;
const getSortDefault = (_, props) => props.prompt.sortOrder;
const propNodeDisplay = (_, props) => props.prompt.nodeDisplay;

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

export const getPrimaryDisplay = createSelector(
  propNodeDisplay,
  nodeDisplay => nodeDisplay.primary,
);

const propSecondaryDisplay = createSelector(
  propNodeDisplay,
  nodeDisplay => (has(nodeDisplay, 'secondary') ? nodeDisplay.secondary : []),
);

export const getSecondaryDisplay = createSelector(
  propSecondaryDisplay,
  secondary => secondary.map(property => omit(property, 'sortable')),
);

export const getSortFields = createSelector(
  getPrimaryDisplay,
  propSecondaryDisplay,
  (primary, secondary) => [primary].concat(secondary.filter(
    property => property.sortable && property.variable).map(property => property.variable),
  ),
);

export const getSortOrderDefault = createSelector(
  getSortDefault,
  sortData => sortData && (Object.keys(sortData)[0] || ''),
);

export const getSortDirectionDefault = createSelector(
  getSortDefault,
  getSortOrderDefault,
  (sortData, key) => sortData && (sortData[key] || ''),
);

export const getDataByPrompt = createSelector(
  getExternalData,
  getDatasourceKey,
  (externalData, key) => externalData[key].nodes,
);
