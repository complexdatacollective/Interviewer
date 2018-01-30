/* eslint-disable import/prefer-default-export */

import { createSelector } from 'reselect';
import { protocolRegistry, protocolForms } from './protocol';

// Prop selectors

const propFields = (_, props) => props.fields;
const propStageForm = (_, props) =>
  (props.stage.form ? props.stage.form : props.stage.creates.entity);
const propForm = (_, { entity, type }) => ({ entity, type });

// MemoedSelectors


const rehydrateField = ({ registry, entity, type, field }) => {
  if (!field.variable) { return field; }

  return {
    name: field.variable,
    component: field.component,
    ...registry[entity][type].variables[field.variable],
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
