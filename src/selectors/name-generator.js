/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { makeGetSubject, makeGetIds, makeGetAdditionalAttributes } from './interface';

// Selectors that are specific to the name generator

/*
These selectors assume the following props:
  stage: which contains the protocol config for the stage
  prompt: which contains the protocol config for the prompt
*/

// MemoedSelectors

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
