import { keys, pickBy } from 'lodash';

const coerceArray = (value) => {
  if (value instanceof Object) {
    return keys(pickBy(value));
  }
  if (value instanceof Array) {
    return value;
  }
  return [];
};

export const required = () =>
  value =>
    (value ? undefined : 'You must answer this question before continuing.');
export const maxLength = max =>
  value =>
    (value && value.length > max ? `Your answer must be ${max} characters or less` : undefined);
export const minLength = min =>
  value =>
    (value && value.length < min ? `Your answer must be ${min} characters or more` : undefined);
export const minValue = min =>
  value =>
    (value && value < min ? `Your answer must be at least ${min}` : undefined);
export const maxValue = max =>
  value =>
    (value && value > max ? `Your answer must be less than ${max}` : undefined);

export const minSelected = min =>
  value =>
    (!value || coerceArray(value).length < min ? `You must choose a minimum of ${min} option(s)` : undefined);

export const maxSelected = max =>
  value =>
    (!value || coerceArray(value).length > max ? `You must choose a maximum of ${max} option(s)` : undefined);

export default {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  minSelected,
  maxSelected,
};
