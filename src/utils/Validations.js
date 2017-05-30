import { keys, pickBy } from 'lodash';

const coerceArray = (value) => {
  if (value instanceof Array) {
    return value;
  }
  return keys(pickBy(value));
};

export const required = () =>
  value =>
    (value ? undefined : 'Required');
export const maxLength = max =>
  value =>
    (value && value.length > max ? `Must be ${max} characters or less` : undefined);
export const minLength = min =>
  value =>
    (value && value.length < min ? `Must be ${min} characters or more` : undefined);
export const minValue = min =>
  value =>
    (value && value < min ? `Must be at least ${min}` : undefined);
export const maxValue = max =>
  value =>
    (value && value > max ? `Must be less than ${max}` : undefined);

export const minSelected = min =>
  value =>
    (value && coerceArray(value).length < min ? `Must choose ${min} or more` : undefined);

export const maxSelected = max =>
  value =>
    (value && coerceArray(value).length > max ? `Must choose ${max} or less` : undefined);

export default {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  minSelected,
  maxSelected,
};
