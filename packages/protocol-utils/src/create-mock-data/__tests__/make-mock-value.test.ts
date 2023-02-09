/* eslint-env jest */
import makeMockValue from '../make-mock-value.js';
import { VariableType } from '@codaco/shared-consts';

describe('make mock values for variable type...', () => {
  it.todo('All tests should use seeding for deterministic values');
  it('number', () => {
    const variable = {
      type: VariableType.number,
      name: 'My number variable',
    };

    // Expect return value to be an integer
    expect(typeof makeMockValue(variable)).toBe('number');
  });

  it('boolean', () => {
    const variable = {
      type: VariableType.boolean,
      name: 'My boolean variable',
    };

    // Expect return value to be a boolean
    expect(typeof makeMockValue(variable)).toBe('boolean');
  });

  it('scalar', () => {
    const variable = {
      type: VariableType.scalar,
      name: 'My scalar variable',
    };

    // Expect return value to be a number
    expect(typeof makeMockValue(variable)).toBe('number');
  });

  it('datetime', () => {
    const variable = {
      type: VariableType.datetime,
      name: 'My datetime variable',
    };

    // Expect return value to be a string
    expect(typeof makeMockValue(variable)).toBe('string');
  });

  it('ordinal', () => {
    const variable = {
      type: VariableType.ordinal,
      name: 'My ordinal variable',
      options: [
        {
          value: 'option 1',
          label: 'Option 1',
        },
        {
          value: 'option 2',
          label: 'Option 2',
        },
      ],
    };

    // Expect return value to be a string
    expect(typeof makeMockValue(variable)).toBe('string');
  });

  it.todo('Categorical values should be able to return multiple membership');

  it('categorical', () => {
    const variable = {
      type: VariableType.categorical,
      name: 'My categorical variable',
      options: [
        {
          value: 'option 1',
          label: 'Option 1',
        },
        {
          value: 'option 2',
          label: 'Option 2',
        },
      ],
    };

    // Expect return value to be an array
    expect(Array.isArray(makeMockValue(variable))).toBe(true);
  });

  it('layout', () => {
    const variable = {
      type: VariableType.layout,
      name: 'My layout variable',
    };

    // Expect return value to be an object
    expect(typeof makeMockValue(variable)).toBe('object');
  });

  it('text', () => {
    const variable = {
      type: VariableType.text,
      name: 'My text variable',
    };

    // Expect return value to be a string
    expect(typeof makeMockValue(variable)).toBe('string');
  });

  it.todo('Handles text with TextArea component differently');
});
