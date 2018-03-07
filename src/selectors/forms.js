import { createSelector } from 'reselect';
import { makeGetNodeType } from './name-generator';
import { protocolRegistry, protocolForms } from './protocol';

// Prop selectors

const propFields = (_, props) => props.fields;
const propStageForm = (_, props) => props.stage.form;
const propForm = (_, { entity, type }) => ({ entity, type });

// Use the node type (e.g. "person") as the fallback form name —
// this should always be present and will be created by architect.
const nodeFormKey = createSelector(
  propStageForm,
  makeGetNodeType(),
  (stageForm, nodeType) => stageForm || nodeType,
);

// MemoedSelectors


const rehydrateField = ({ registry, entity, type, field }) => {
  if (!field.variable) { return field; }

  return {
    name: field.variable,
    component: field.component,
    value: field.value,
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
    [nodeFormKey, protocolForms],
    (form, forms) => forms[form],
  );
