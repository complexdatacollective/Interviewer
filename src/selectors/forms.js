import { createSelector } from 'reselect';
import { get } from '../utils/lodash-replacements';
import { getProtocolCodebook } from './protocol';

// Prop selectors

const propFields = (_, props) => props.fields || [];
const propStageSubject = (_, props) => props.subject || { entity: 'ego' };

// MemoedSelectors

export const rehydrateField = ({
  codebook, entity, type, field,
}) => {
  if (!field.variable) { return field; }

  const entityPath = entity === 'ego' ? [entity] : [entity, type];

  const entityProperties = get(codebook, [...entityPath, 'variables', field.variable], {});

  return {
    ...entityProperties,
    name: field.variable,
    fieldLabel: field.prompt,
    value: field.value,
  };
};

export const makeRehydrateFields = () => createSelector(
  propStageSubject,
  propFields,
  (state, props) => getProtocolCodebook(state, props),
  ({ entity, type }, fields, codebook) => fields.map(
    (field) => rehydrateField({
      codebook, entity, type, field,
    }),
  ),
);
