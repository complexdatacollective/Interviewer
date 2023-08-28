import {
  filter,
  isEqual,
  isNil,
  isNumber,
  isString,
  some,
  get,
} from 'lodash';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { makeNetworkEntitiesForType } from '../selectors/interface';
import { getCodebookVariablesForType } from '../selectors/session';

// Return an array of values given either a collection, an array,
// or a single value
const coerceArray = (value) => {
  if (value instanceof Object) {
    return value.reduce((acc, individual) => ([...acc, individual.value]), []);
  }
  if (value instanceof Array) {
    return value;
  }
  return [];
};

export const validateUrl = (message) => (url) => {
  try {
    const constructURL = new URL(url);

    if (constructURL.protocol !== 'http:' && constructURL.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch (e) {
    return message || 'Please enter a valid URL, including http:// or https://';
  }

  return undefined;
};

export const required = (message) => (value) => {
  const isEmptyString = isString(value) && value.length === 0;

  if (isNil(value) || isEmptyString) {
    return message || 'You must answer this question before continuing';
  }

  return undefined;
};

export const maxLength = (max) => (value) => (value && value.length > max ? `Your answer must be ${max} characters or less` : undefined);
export const minLength = (min) => (value) => (!value || value.length < min ? `Your answer must be ${min} characters or more` : undefined);
export const minValue = (min) => (value) => (isNumber(value) && value < min ? `Your answer must be at least ${min}` : undefined);
export const maxValue = (max) => (value) => (isNumber(value) && value > max ? `Your answer must be less than ${max}` : undefined);

export const minSelected = (min) => (value) => (!value || coerceArray(value).length < min ? `You must choose a minimum of ${min} option(s)` : undefined);

export const maxSelected = (max) => (value) => (value && coerceArray(value).length > max ? `You must choose a maximum of ${max} option(s)` : undefined);

const isMatchingValue = (submittedValue, existingValue) => {
  if (submittedValue && existingValue && existingValue instanceof Array) {
    return isEqual(submittedValue.sort(), existingValue.sort());
  }
  if (submittedValue && existingValue && existingValue instanceof Object) {
    return isEqual(submittedValue, existingValue);
  }
  return submittedValue === existingValue;
};

const isSomeValueMatching = (value, otherNetworkEntities, name) => (
  some(otherNetworkEntities, (entity) => entity.attributes
    && isMatchingValue(value, entity.attributes[name])));

const getOtherNetworkEntities = (entities, entityId) => filter(
  entities,
  (node) => (!entityId || node[entityPrimaryKeyProperty] !== entityId),
);

export const unique = (_, store) => {
  const networkEntitiesForType = makeNetworkEntitiesForType();

  return (value, __, { validationMeta }, name) => {
    const otherNetworkEntities = getOtherNetworkEntities(
      networkEntitiesForType(store.getState()),
      validationMeta?.entityId,
    );

    return isSomeValueMatching(value, otherNetworkEntities, name) ? 'Your answer must be unique' : undefined;
  };
};

const getVariableName = (variableId, store) => {
  const codebookVariablesForType = getCodebookVariablesForType()(store.getState());
  return get(codebookVariablesForType, [variableId, 'name']);
};

const getVariableType = (variableId, store) => {
  const codebookVariablesForType = getCodebookVariablesForType()(store.getState());
  return get(codebookVariablesForType, [variableId, 'type']);
};

export const differentFrom = (variableId, store) => {
  const variableName = getVariableName(variableId, store);
  return (value, allValues) => (isMatchingValue(value, allValues[variableId]) ? `Your answer must be different from ${variableName}` : undefined);
};

export const sameAs = (variableId, store) => {
  const variableName = getVariableName(variableId, store);
  return (value, allValues) => (!isMatchingValue(value, allValues[variableId]) ? `Your answer must be the same as ${variableName}` : undefined);
};

const compareVariables = (value1, value2, type) => {
  // check for dates
  if (type === 'datetime') {
    const date1 = new Date(value1);
    const date2 = new Date(value2);
    return date1.valueOf() - date2.valueOf();
  }

  // check for numbers (could be number, ordinal, scalar, etc)
  if (isNumber(value1) && isNumber(value2)) {
    return value1 - value2;
  }

  // string compare
  if (isString(value1) && isString(value2)) {
    return value1.localeCompare(value2);
  }

  return value1 < value2 ? -1 : 1;
};

export const greaterThanVariable = (variableId, store) => {
  const variableName = getVariableName(variableId, store);
  const variableType = getVariableType(variableId, store);
  return (value, allValues) => (isNil(value) || (compareVariables(value, allValues[variableId], variableType) <= 0) ? `Your answer must be greater than ${variableName}` : undefined);
};

export const lessThanVariable = (variableId, store) => {
  const variableName = getVariableName(variableId, store);
  const variableType = getVariableType(variableId, store);
  return (value, allValues) => (isNil(value) || (compareVariables(value, allValues[variableId], variableType) >= 0) ? `Your answer must be less than ${variableName}` : undefined);
};

export default {
  required: () => required(),
  minLength,
  maxLength,
  minValue,
  maxValue,
  minSelected,
  maxSelected,
  unique,
  differentFrom,
  sameAs,
  greaterThanVariable,
  lessThanVariable,
};
