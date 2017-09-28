/* eslint-disable import/prefer-default-export */

import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'lodash';

// create a "selector creator" that uses lodash.isEqual instead of ===
const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

// Prop selectors

const propFields = (_, props) => props.fields;

// MemoedSelectors

export const protocolRegistry = createDeepEqualSelector(
  state => state.protocol.config.registry,
  registry => registry,
);

export const rehydrateFieldsFromRegistry = createSelector(
  [propFields, protocolRegistry],
  (fields, registry) =>
    fields.map(
      (field) => {
        switch (typeof field) {
          case 'string':
            return { name: field, ...registry[field] };
          default:
            return field;
        }
      }),
);
