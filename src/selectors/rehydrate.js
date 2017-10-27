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
const propForm = (_, props) => (props.stage.form ? props.stage.form : props.stage.creates);

// MemoedSelectors

export const protocolRegistry = createDeepEqualSelector(
  state => state.protocol.registry,
  registry => registry,
);

export const protocolForms = createDeepEqualSelector(
  state => state.protocol.forms,
  forms => forms,
);

const rehydrateField = (registry, field) => {
  if (!field.variable) { return field; }
  return { name: field.variable, component: field.component, ...registry[field.variable] };
};

export const makeRehydrateFields = () =>
  createSelector(
    [propFields, protocolRegistry],
    (fields, registry) =>
      fields.map(
        field => rehydrateField(registry, field),
      ),
  );

export const makeRehydrateForm = () =>
  createSelector(
    [propForm, protocolForms],
    (form, forms) => forms[form],
  );
