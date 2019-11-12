/* eslint-env jest */

import {
  required,
  // minLength,
  // maxLength,
  // minValue,
  // maxValue,
  // minSelected,
  // maxSelected,
} from '../Validations';

describe('Validations', () => {
  describe('required', () => {
    const errorMessage = 'You must answer this question before continuing.';

    it('passes for a string', () => {
      expect(required()('hello world')).toBe(undefined);
    });

    it('passes for a numerical value', () => {
      expect(required()(3)).toBe(undefined);
      expect(required()(0)).toBe(undefined);
    });

    it('fails for null or undefined', () => {
      expect(required()(null)).toEqual(errorMessage);
      expect(required()(undefined)).toEqual(errorMessage);
    });

    it('fails for an empty string', () => {
      expect(required()('')).toEqual(errorMessage);
    });
  });
});
