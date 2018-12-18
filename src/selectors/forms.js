import { createSelector } from 'reselect';
import { mapValues } from 'lodash';
import { protocolRegistry, protocolForms } from './protocol';

// Prop selectors

const propFields = (_, props) => props.fields;
const propStageForm = (_, props) => props.stage.form;
const propForm = (_, { entity, type }) => ({ entity, type });

// MemoedSelectors


const rehydrateField = ({ registry, entity, type, field }) => {
  if (!field.variable) { return field; }

  const entityVars = registry[entity][type] ?
    registry[entity][type].variables[field.variable] :
    {};

  const returnObject = {
    ...entityVars,
    name: field.variable,
    component: field.component,
    fieldLabel: field.label,
    value: field.value,
  };

  return returnObject;
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
    (form, forms) => forms[form] || null,
  );

/**
 * @return {Object} keyed by form name
 */
export const getDefaultFormValues = createSelector(
  protocolForms,
  forms => mapValues(
    forms,
    ({ fields }) =>
      fields.reduce(
        (memo, { variable, value }) => {
          if (!value) { return memo; }
          return { ...memo, [variable]: value };
        },
        {},
      ),
  ),
);
