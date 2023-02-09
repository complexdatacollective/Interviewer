/* eslint-env jest */
const predicate = require('../predicate').default;
const operators = require('../predicate').operators;
const countOperators = require('../predicate').countOperators;

describe('predicate', () => {
  it('default', () => {
    expect(predicate(null)({ value: null, other: null })).toBe(false);
  });

  describe('operators', () => {
    it('GREATER_THAN', () => {
      expect(
        predicate(operators.GREATER_THAN)({ value: 1.5, other: 1 }),
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN)({ value: 2, other: 2 }),
      ).toBe(false);
    });

    it('LESS_THAN', () => {
      expect(
        predicate(operators.LESS_THAN)({ value: 1, other: 1.5 }),
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN)({ value: 2, other: 2 }),
      ).toBe(false);
    });

    it('GREATER_THAN_OR_EQUAL', () => {
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 1.5, other: 1 }),
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 2, other: 2 }),
      ).toBe(true);
      expect(
        predicate(operators.GREATER_THAN_OR_EQUAL)({ value: 2, other: 3 }),
      ).toBe(false);
    });

    it('LESS_THAN_OR_EQUAL', () => {
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 1, other: 1.5 }),
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 2, other: 2 }),
      ).toBe(true);
      expect(
        predicate(operators.LESS_THAN_OR_EQUAL)({ value: 3, other: 2 }),
      ).toBe(false);
    });

    it('EXACTLY', () => {
      expect(
        predicate(operators.EXACTLY)({ value: 1, other: 1 }),
      ).toBe(true);
      expect(
        predicate(operators.EXACTLY)({ value: 2, other: 1 }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: null, other: 0 }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: 'word', other: 'word' }),
      ).toBe(true);
      expect(
        predicate(operators.EXACTLY)({ value: 'not word', other: 'word' }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: null, other: 'word' }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: true, other: true }),
      ).toBe(true);
      expect(
        predicate(operators.EXACTLY)({ value: false, other: true }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: null, other: true }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: true, other: false }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: false, other: false }),
      ).toBe(true);
      expect(
        predicate(operators.EXACTLY)({ value: null, other: false }),
      ).toBe(false);
      expect(
        predicate(operators.EXACTLY)({ value: false, other: null }),
      ).toBe(false);
    });

    it('NOT', () => {
      expect(
        predicate(operators.NOT)({ value: 1, other: 1 }),
      ).toBe(false);
      expect(
        predicate(operators.NOT)({ value: 2, other: 1 }),
      ).toBe(true);
      expect(
        predicate(operators.NOT)({ value: null, other: false }),
      ).toBe(true);
      expect(
        predicate(operators.NOT)({ value: null, other: true }),
      ).toBe(true);
      expect(
        predicate(operators.NOT)({ value: false, other: null }),
      ).toBe(true);
      expect(
        predicate(operators.NOT)({ value: false, other: true }),
      ).toBe(true);
      expect(
        predicate(operators.NOT)({ value: true, other: false }),
      ).toBe(true);
    });

    it('CONTAINS', () => {
      expect(
        predicate(operators.CONTAINS)({ value: 'word', other: 'wo' }),
      ).toBe(true);
      expect(
        predicate(operators.CONTAINS)({ value: 'word', other: '^w' }),
      ).toBe(true);
      expect(
        predicate(operators.CONTAINS)({ value: 'word', other: '^g' }),
      ).toBe(false);
    });

    it('DOES_NOT_CONTAIN', () => {
      expect(
        predicate(operators.DOES_NOT_CONTAIN)({ value: 'word', other: 'go' }),
      ).toBe(true);
      expect(
        predicate(operators.DOES_NOT_CONTAIN)({ value: 'word', other: '^g' }),
      ).toBe(true);
      expect(
        predicate(operators.DOES_NOT_CONTAIN)({ value: 'word', other: '^w' }),
      ).toBe(false);
    });

    it('EXISTS', () => {
      expect(
        predicate(operators.EXISTS)({ value: null }),
      ).toBe(false);
      expect(
        predicate(operators.EXISTS)({ value: 1 }),
      ).toBe(true);
    });

    it('NOT_EXISTS', () => {
      expect(
        predicate(operators.NOT_EXISTS)({ value: 1 }),
      ).toBe(false);
      expect(
        predicate(operators.NOT_EXISTS)({ value: null }),
      ).toBe(true);
    });

    describe('INCLUDES', () => {
      it('Other = string', () => {
        expect(
          predicate(operators.INCLUDES)({ value: ['a'], other: 'a' }),
        ).toBe(true);
        expect(
          predicate(operators.INCLUDES)({ value: ['a', 'b'], other: 'a' }),
        ).toBe(true);
        expect(
          predicate(operators.INCLUDES)({ value: ['c', 'd'], other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['d'], other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: 'a', other: 'a' }),
        ).toBe(true);
        expect(
          predicate(operators.INCLUDES)({ value: 'a', other: 'aa' }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: 6, other: 'a' }),
        ).toBe(false);
      });

      it('Other = array', () => {
        expect(
          predicate(operators.INCLUDES)({ value: ['a'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['a', 'b'], other: ['a', 'b'] }),
        ).toBe(true);
        expect(
          predicate(operators.INCLUDES)({ value: ['c', 'd'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['d'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: 'a', other: ['a', 'b'] }),
        ).toBe(true);
        expect(
          predicate(operators.INCLUDES)({ value: 6, other: ['a', 'b'] }),
        ).toBe(false);
      });

      it('Other = integer', () => {
        expect(
          predicate(operators.INCLUDES)({ value: ['a'], other: 6 }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['a', 'b'], other: 6 }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['c', 'd'], other: 6 }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: ['d'], other: 6 }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: 'a', other: 6 }),
        ).toBe(false);
        expect(
          predicate(operators.INCLUDES)({ value: 6, other: 6 }),
        ).toBe(true);
      });
    });

    // True if other is not included in value
    describe('EXCLUDES', () => {
      it('Other = string', () => {
        expect(
          predicate(operators.EXCLUDES)({ value: ['a'], other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'b'], other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'c', 'd'], other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['d'], other: 'a' }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: 'a', other: 'a' }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: 'a', other: 'aa' }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: 6, other: 'a' }),
        ).toBe(true);
      });

      it('Other = array', () => {
        expect(
          predicate(operators.EXCLUDES)({ value: ['a'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'b'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'c', 'd'], other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: ['d'], other: ['a', 'b'] }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: 'a', other: ['a', 'b'] }),
        ).toBe(false);
        expect(
          predicate(operators.EXCLUDES)({ value: 6, other: ['a', 'b'] }),
        ).toBe(true);
      });

      it('Other = integer', () => {
        expect(
          predicate(operators.EXCLUDES)({ value: ['a'], other: 6 }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'b'], other: 6 }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: ['a', 'c', 'd'], other: 6 }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: ['d'], other: 6 }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: 'a', other: 6 }),
        ).toBe(true);
        expect(
          predicate(operators.EXCLUDES)({ value: 6, other: 6 }),
        ).toBe(false);
      });
    });

    it('OPTIONS_GREATER_THAN', () => {
      const other = 2;
      const value1 = ['a', 'b'];
      const value2 = ['a', 'c', 'd'];

      expect(
        predicate(operators.OPTIONS_GREATER_THAN)({ value: value1, other }),
      ).toBe(false);
      expect(
        predicate(operators.OPTIONS_GREATER_THAN)({ value: value2, other }),
      ).toBe(true);
    });

    it('OPTIONS_LESS_THAN', () => {
      const other = 2;
      const value1 = ['a'];
      const value2 = ['a', 'c', 'd'];

      expect(
        predicate(operators.OPTIONS_LESS_THAN)({ value: value1, other }),
      ).toBe(true);
      expect(
        predicate(operators.OPTIONS_LESS_THAN)({ value: value2, other }),
      ).toBe(false);
    });


    it('OPTIONS_EQUALS', () => {
      const other = 2;
      const value1 = ['a', 'b'];
      const value2 = ['a', 'c', 'd'];

      expect(
        predicate(operators.OPTIONS_EQUALS)({ value: value1, other }),
      ).toBe(true);
      expect(
        predicate(operators.OPTIONS_EQUALS)({ value: value2, other }),
      ).toBe(false);
    });

    it('OPTIONS_NOT_EQUALS', () => {
      const other = 2;
      const value1 = ['a', 'b'];
      const value2 = ['a', 'c', 'd'];

      expect(
        predicate(operators.OPTIONS_NOT_EQUALS)({ value: value1, other }),
      ).toBe(false);
      expect(
        predicate(operators.OPTIONS_NOT_EQUALS)({ value: value2, other }),
      ).toBe(true);
    });
  });

  describe('Count operators', () => {
    it('COUNT_GREATER_THAN', () => {
      expect(
        predicate(countOperators.COUNT_GREATER_THAN)({ value: 1.5, other: 1 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN)({ value: 2, other: 2 }),
      ).toBe(false);
    });

    it('COUNT_LESS_THAN', () => {
      expect(
        predicate(countOperators.COUNT_LESS_THAN)({ value: 1, other: 1.5 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN)({ value: 2, other: 2 }),
      ).toBe(false);
    });

    it('COUNT_GREATER_THAN_OR_EQUAL', () => {
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 1.5, other: 1 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 2, other: 2 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_GREATER_THAN_OR_EQUAL)({ value: 2, other: 3 }),
      ).toBe(false);
    });

    it('COUNT_LESS_THAN_OR_EQUAL', () => {
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 1, other: 1.5 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 2, other: 2 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT_LESS_THAN_OR_EQUAL)({ value: 3, other: 2 }),
      ).toBe(false);
    });

    it('COUNT', () => {
      expect(
        predicate(countOperators.COUNT)({ value: 1, other: 1 }),
      ).toBe(true);
      expect(
        predicate(countOperators.COUNT)({ value: 2, other: 1 }),
      ).toBe(false);
    });

    it('COUNT_NOT', () => {
      expect(
        predicate(countOperators.COUNT_NOT)({ value: 1, other: 1 }),
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_NOT)({ value: 2, other: 1 }),
      ).toBe(true);
    });

    it('COUNT_ANY', () => {
      expect(
        predicate(countOperators.COUNT_ANY)({ value: 0 }),
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_ANY)({ value: 100 }),
      ).toBe(true);
    });

    it('COUNT_NONE', () => {
      expect(
        predicate(countOperators.COUNT_NONE)({ value: 100 }),
      ).toBe(false);
      expect(
        predicate(countOperators.COUNT_NONE)({ value: 0 }),
      ).toBe(true);
    });
  });
});
