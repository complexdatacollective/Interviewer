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
    (value && value < min ? `Must be at least ${min} characters` : undefined);
export const maxValue = max =>
  value =>
    (value && value > max ? `Must be less than ${max} characters` : undefined);

export default {
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
};
