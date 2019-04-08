import { createSelector } from 'reselect';
import { getProtocolCodebook } from './protocol';

// Prop selectors

const propFields = (_, props) => props.fields;
const propStageSubject = (_, props) => props.subject || { entity: 'ego' };

// MemoedSelectors

export const rehydrateField = ({ codebook, entity, type, field }) => {
  if (!field.variable) { return field; }

  let entityVars;

  if (entity === 'ego') {
    entityVars = codebook[entity] ?
      codebook[entity].variables[field.variable] :
      {};
  } else {
    entityVars = codebook[entity][type] ?
      codebook[entity][type].variables[field.variable] :
      {};
  }

  const returnObject = {
    ...entityVars,
    name: field.variable,
    component: field.component,
    fieldLabel: field.prompt,
    value: field.value,
    validation: field.validation,
  };

  return returnObject;
};

export const makeRehydrateFields = () =>
  createSelector(
    propStageSubject,
    propFields,
    (state, props) => getProtocolCodebook(state, props),
    ({ entity, type }, fields, codebook) => fields.map(
      field => rehydrateField({ codebook, entity, type, field }),
    ),
  );
