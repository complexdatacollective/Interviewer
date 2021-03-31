import {
  isEqual, isNil, isNumber, isString, keys, pickBy, some,
} from 'lodash';

const coerceArray = (value) => {
  if (value instanceof Object) {
    return keys(pickBy(value));
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
export const minLength = (min) => (value) => (value && value.length < min ? `Your answer must be ${min} characters or more` : undefined);
export const minValue = (min) => (value) => (isNumber(value) && value < min ? `Your answer must be at least ${min}` : undefined);
export const maxValue = (max) => (value) => (isNumber(value) && value > max ? `Your answer must be less than ${max}` : undefined);

export const minSelected = (min) => (value) => (!value || coerceArray(value).length < min ? `You must choose a minimum of ${min} option(s)` : undefined);

export const maxSelected = (max) => (value) => (!value || coerceArray(value).length > max ? `You must choose a maximum of ${max} option(s)` : undefined);

const isMatchingValue = (submittedValue, existingValue) => {
  if (submittedValue && existingValue && existingValue instanceof Array) {
    return isEqual(submittedValue.sort(), existingValue.sort());
  }
  return submittedValue === existingValue;
};

const isSomeValueMatching = (value, otherNetworkEntities, name) => (
  some(otherNetworkEntities, (entity) => entity.attributes && entity.attributes[name]
    && isMatchingValue(value, entity.attributes[name])));

export const unique = () => (value, _, props, name) => (isSomeValueMatching(value, props.otherNetworkEntities, name) ? 'Your answer must be unique' : undefined);
export const differentFrom = (varUuid) => (value, allValues) => (isMatchingValue(value, allValues[varUuid]) ? `Your answer must be different from ${allValues[varUuid]}` : undefined);
export const sameAs = (varUuid) => (value, allValues) => (!isMatchingValue(value, allValues[varUuid]) ? `Your answer must be the same as ${allValues[varUuid]}` : undefined);

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
};
