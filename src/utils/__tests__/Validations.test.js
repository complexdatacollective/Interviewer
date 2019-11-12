/* eslint-env jest */

import {
  required,
  minLength,
  maxLength,
  // minValue,
  // maxValue,
  // minSelected,
  // maxSelected,
} from '../Validations';

describe('Validations', () => {
  describe('required()', () => {
    const errorMessage = 'You must answer this question before continuing';
    const subject = required();

    it('passes for a string', () => {
      expect(subject('hello world')).toBe(undefined);
    });

    it('passes for a numerical value', () => {
      expect(subject(3)).toBe(undefined);
      expect(subject(0)).toBe(undefined);
    });

    it('fails for null or undefined', () => {
      expect(subject(null)).toEqual(errorMessage);
      expect(subject(undefined)).toEqual(errorMessage);
    });

    it('fails for an empty string', () => {
      expect(subject('')).toEqual(errorMessage);
    });
  });

  describe('minLength()', () => {
    const errorMessage = 'Your answer must be 5 characters or more';
    const subject = minLength(5);

    it('passes for null or undefined', () => {
      expect(subject(null)).toBe(undefined);
      expect(subject(undefined)).toBe(undefined);
    });

    it('fails for a short string', () => {
      expect(subject('hi')).toBe(errorMessage);
    });

    it('passes for an exactly matching string', () => {
      expect(subject('hello')).toBe(undefined);
    });

    it('passes for a long string', () => {
      expect(subject('hello world')).toBe(undefined);
    });
  });

  describe('maxLength()', () => {
    const errorMessage = 'Your answer must be 5 characters or less';
    const subject = maxLength(5);

    it('passes for null or undefined', () => {
      expect(subject(null)).toBe(undefined);
      expect(subject(undefined)).toBe(undefined);
    });

    it('passes for a short string', () => {
      expect(subject('hi')).toBe(undefined);
    });

    it('passes for an exactly matching string', () => {
      expect(subject('hello')).toBe(undefined);
    });

    it('fails for a long string', () => {
      expect(subject('hello world')).toBe(errorMessage);
    });
  });
});
