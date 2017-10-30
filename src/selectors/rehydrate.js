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
const propStageForm = (_, props) =>
  (props.stage.form ? props.stage.form : props.stage.creates.entity);
const propForm = (_, { entity, type }) => ({ entity, type });

// MemoedSelectors

export const protocolRegistry = createDeepEqualSelector(
  state => state.protocol.variableRegistry,
  registry => registry,
);

export const protocolForms = createDeepEqualSelector(
  state => state.protocol.forms,
  forms => forms,
);

const rehydrateField = ({ registry, entity, type, field }) => {
  if (!field.variable) { return field; }
  return {
    name: field.variable,
    component: field.component,
    ...registry[entity][type][field.variable],
  };
};

export const makeRehydrateFields = () =>
  createSelector(
    [propForm, propFields, protocolRegistry],
    ({ entity, type }, fields, registry) =>
      fields.map(
        field => rehydrateField({ registry, entity, type, field }),
      ),
  );

export const makeRehydrateForm = () =>
  createSelector(
    [propStageForm, protocolForms],
    (form, forms) => forms[form],
  );
