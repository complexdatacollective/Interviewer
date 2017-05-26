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
    (value && value.length < min ? `Must choose at least ${min}` : undefined);
export const maxSelected = max =>
  value =>
    (value && value.length > max ? `Must choose at least ${max}` : undefined);

export default {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  minSelected,
  maxSelected,
};
