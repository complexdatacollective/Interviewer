/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */
import { entityAttributesProperty } from '@codaco/shared-consts';
import sortOrder from '../sortOrder';

const mockItems = [
  {
    type: 'human',
    [entityAttributesProperty]: {
      name: 'abigail',
      age: 20,
      favouriteColor: 'red',
    },
  },
  {
    type: 'human',
    [entityAttributesProperty]: {
      name: 'benjamin',
      age: 50,
      favouriteColor: 'green',
    },
  },
  {
    type: 'human',
    [entityAttributesProperty]: {
      name: 'carolyn',
      age: 30,
      favouriteColor: 'blue',
    },
  },
  {
    type: 'human',
    [entityAttributesProperty]: {
      name: 'eugine',
      age: 20,
      favouriteColor: 'green',
    },
  },
  {
    type: 'animal',
    [entityAttributesProperty]: {
      name: 'zebra',
      age: 20,
      favouriteColor: 'green',
    },
  },
  {
    type: 'human',
    [entityAttributesProperty]: {
      name: 'dave',
      age: 20,
      favouriteColor: 'blue',
    },
  },
];

describe('sortOrder', () => {
  it('it does not change order when rules are empty', () => {
    const sorter = sortOrder();
    expect(sorter(mockItems)).toMatchObject(mockItems);
  });

  it('it does not add any properties to items', () => {
    const sorter = sortOrder();
    expect(sorter(mockItems)[0]).toEqual(mockItems[0]);
  });

  describe('order direction', () => {
    it('orders ascending with "asc"', () => {
      const sorter = sortOrder([{
        property: 'age',
        direction: 'asc',
      }]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item[entityAttributesProperty].name);

      expect(resultNames).toEqual(['abigail', 'eugine', 'zebra', 'dave', 'carolyn', 'benjamin']);
    });

    it('orders descending with "desc"', () => {
      const sorter = sortOrder([{
        property: 'age',
        direction: 'desc',
      }]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item[entityAttributesProperty].name);

      expect(resultNames).toEqual(['benjamin', 'carolyn', 'abigail', 'eugine', 'zebra', 'dave']);
    });
  });

  it('can order multiple properties and directions', () => {
    const sorter = sortOrder([
      {
        property: 'age',
        direction: 'asc',
      },
      {
        property: 'name',
        direction: 'desc',
      },
    ]);

    expect(sorter(mockItems)).toMatchObject([
      { [entityAttributesProperty]: { name: 'eugine' } },
      { [entityAttributesProperty]: { name: 'dave' } },
      { [entityAttributesProperty]: { name: 'abigail' } },
      { [entityAttributesProperty]: { name: 'carolyn' } },
      { [entityAttributesProperty]: { name: 'benjamin' } },
    ]);
  });

  it('handles missing [entityAttributesProperty]', () => {
    const sorter = sortOrder([
      {
        property: 'name',
        direction: 'desc',
      },
      {
        property: 'missingAttribute',
        direction: 'asc',
      },
    ]);

    expect(sorter(mockItems)).toMatchObject([
      { [entityAttributesProperty]: { name: 'eugine' } },
      { [entityAttributesProperty]: { name: 'dave' } },
      { [entityAttributesProperty]: { name: 'carolyn' } },
      { [entityAttributesProperty]: { name: 'benjamin' } },
      { [entityAttributesProperty]: { name: 'abigail' } },
    ]);
  });

  it('treats "*" property as fifo ordering', () => {
    const sorter = sortOrder([{
      property: '*',
      direction: 'asc',
    }]);

    expect(sorter(mockItems)).toMatchObject(mockItems);
  });

  it('treats "*" ("desc") as lifo ordering', () => {
    const sorter = sortOrder([{
      property: '*',
      direction: 'desc',
    }]);

    expect(sorter(mockItems)).toMatchObject([...mockItems].reverse());
  });
});
