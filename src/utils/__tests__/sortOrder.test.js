/* eslint-env jest */
import sortOrder from '../sortOrder';

const mockItems = [
  {
    name: 'abigail',
    age: 20,
    favouriteColor: 'red',
  },
  {
    name: 'benjamin',
    age: 50,
    favouriteColor: 'green',
  },
  {
    name: 'carolyn',
    age: 30,
    favouriteColor: 'blue',
  },
  {
    name: 'eugine',
    age: 20,
    favouriteColor: 'green',
  },
  {
    name: 'dave',
    age: 20,
    favouriteColor: 'blue',
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

      expect(sorter(mockItems)).toMatchObject([
        { name: 'abigail' },
        { name: 'eugine' },
        { name: 'dave' },
        { name: 'carolyn' },
        { name: 'benjamin' },
      ]);
    });

    it('orders descending with "desc"', () => {
      const sorter = sortOrder([{
        property: 'age',
        direction: 'desc',
      }]);

      expect(sorter(mockItems)).toMatchObject([
        { name: 'benjamin' },
        { name: 'carolyn' },
        { name: 'abigail' },
        { name: 'eugine' },
        { name: 'dave' },
      ]);
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
      { name: 'eugine' },
      { name: 'dave' },
      { name: 'abigail' },
      { name: 'carolyn' },
      { name: 'benjamin' },
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
