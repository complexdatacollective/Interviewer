/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */
import createSorter from '../sortOrder2';

describe('createSorter', () => {
  it('it does not change order when rules are empty', () => {
    const mockItems = [
      {
        type: 'human',
        name: 'abigail',
      },
      {
        type: 'human',
        name: 'benjamin',
      },
      {
        type: 'human',
        name: 'carolyn',
      },
    ];

    const sorter = createSorter();
    expect(sorter(mockItems)).toMatchObject(mockItems);
  });

  it('it does not add any properties to items', () => {
    const mockItems = [
      {
        foo: 'bar',
      },
    ];

    const sorter = createSorter();
    expect(sorter(mockItems)[0]).toEqual(mockItems[0]);
  });

  describe('Order direction', () => {
    it('orders ascending with "asc"', () => {
      const mockItems = [
        {
          name: 'abigail',
        },
        {
          name: 'benjamin',
        },
        {
          name: 'carolyn',
        },
      ];

      const sorter = createSorter([{
        property: 'name',
        direction: 'asc',
      }]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['abigail', 'benjamin', 'carolyn']);
    });

    it('orders descending with "desc"', () => {
      const mockItems = [
        {
          name: 'abigail',
        },
        {
          name: 'benjamin',
        },
        {
          name: 'carolyn',
        },
      ];

      const sorter = createSorter([{
        property: 'name',
        direction: 'desc',
      }]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['carolyn', 'benjamin', 'abigail']);
    });

    it('can order multiple properties and directions', () => {
      const mockItems = [
        {
          age: 20,
          name: 'benjamin',
        },
        {
          age: 20,
          name: 'carolyn',
        },
        {
          age: 20,
          name: 'abigail',
        },
        {
          age: 20,
          name: 'richard',
        },
        {
          age: 6,
          name: 'eugine',
        },
        {
          age: 4,
          name: 'timmy',
        },
      ];

      const sorter = createSorter([
        {
          property: 'age',
          direction: 'asc',
        },
        {
          property: 'name',
          direction: 'desc',
        },
      ]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['timmy', 'eugine', 'richard', 'carolyn', 'benjamin', 'abigail']);
    });

    it('orders numerical values numerically', () => {
      const mockItems = [
        {
          type: 'human',
          age: 20,
        },
        {
          type: 'human',
          age: 30,
        },
        {
          type: 'human',
          // age: 10, - missing
        },
        {
          type: 'human',
          age: 10,
        },
      ];

      let sorter;

      sorter = createSorter([{
        property: 'age',
        type: 'number',
        direction: 'asc',
      }]);
      const result = sorter(mockItems);
      const resultAges = result.map((item) => item.age);

      expect(resultAges).toEqual([10, 20, 30, undefined]);

      sorter = createSorter([{
        property: 'age',
        type: 'number',
        direction: 'desc',
      }]);
      const result2 = sorter(mockItems);
      const resultAges2 = result2.map((item) => item.age);

      expect(resultAges2).toEqual([30, 20, 10, undefined]);
    });

    it('orders date values', () => {
      const mockItems = [
        {
          type: 'human',
          birthdate: '1990-01-01',
        },
        {
          type: 'human',
          birthdate: '1980-01-01',
        },
        {
          type: 'human',
          birthdate: '1970-01-01',
        },
      ];

      const sorter = createSorter([{
        property: 'birthdate',
        direction: 'asc',
      }]);
      const result = sorter(mockItems);
      const resultBirthdates = result.map((item) => item.birthdate);

      expect(resultBirthdates).toEqual(['1970-01-01', '1980-01-01', '1990-01-01']);
    });

    it('orders boolean values', () => {
      const mockItems = [
        {
          type: 'human',
          isAlive: true,
          name: 'abigail',
        },
        {
          type: 'human',
          isAlive: false,
          name: 'benjamin',
        },
        {
          type: 'human',
          isAlive: true,
          name: 'carolyn',
        },
      ];

      const sorter = createSorter([{
        property: 'isAlive',
        type: 'boolean',
        direction: 'asc',
      }]);
      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['benjamin', 'abigail', 'carolyn']);

      const sorter2 = createSorter([{
        property: 'isAlive',
        direction: 'desc',
      }]);
      const result2 = sorter2(mockItems);
      const resultNames2 = result2.map((item) => item.name);

      expect(resultNames2).toEqual(['abigail', 'carolyn', 'benjamin']);
    });
  });

  describe('Missing attributes', () => {
    it('ignores missing property', () => {
      const mockItems = [
        {
          type: 'human',
          name: 'abigail',
        },
        {
          type: 'human',
          name: 'benjamin',
        },
      ];

      const sorter = createSorter([
        {
          property: 'name',
          direction: 'desc',
        },
        {
          property: 'missingAttribute',
          direction: 'asc',
        },
      ]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['benjamin', 'abigail']);
    });

    it('handles missing property on some items', () => {
      let sorter;

      const mockItems = [
        {
          type: 'human',
          name: 'abigail',
        },
        {
          type: 'human',
        },
        {
          type: 'human',
          name: 'benjamin',
        },
      ];

      sorter = createSorter([
        {
          property: 'name',
          direction: 'asc',
        },
      ]);

      const resultNamesAsc = sorter(mockItems).map((item) => item.name);
      expect(resultNamesAsc).toEqual(['abigail', 'benjamin', undefined]);

      sorter = createSorter([
        {
          property: 'name',
          direction: 'desc',
        },
      ]);

      const resultNamesDesc = sorter(mockItems).map((item) => item.name);
      expect(resultNamesDesc).toEqual(['benjamin', 'abigail', undefined]);
    });

    it('handles undefined and null property values', () => {
      let sorter;
      const mockItems = [
        {
          id: 3,
          name: null,
        },
        {
          id: 4,
          name: undefined,
        },
        {
          id: 5,
        },
        {
          id: 1,
          name: 'abigail',
        },
        {
          id: 2,
          name: 'benjamin',
        },
      ];

      sorter = createSorter([
        {
          property: 'name',
          direction: 'asc',
        },
      ]);

      const resultIDsAsc = sorter(mockItems).map((item) => item.id);
      expect(resultIDsAsc).toEqual([1, 2, 3, 4, 5]);

      sorter = createSorter([
        {
          property: 'name',
          direction: 'desc',
        },
      ]);

      const resultIDsDesc = sorter(mockItems).map((item) => item.id);
      expect(resultIDsDesc).toEqual([2, 1, 3, 4, 5]);
    });

    it('handles nested missing properties', () => {
      const mockItems = [
        {
          id: 1,
        },
        {
          id: 2,
          address: {
            country: undefined,
          },
        },
        {
          id: 3,
          address: {
            country: null,
          },
        },
        {
          id: 4,
          address: {
            country: 'zimbabwe',
          },
        },
        {
          id: 5,
          address: {
            country: 'albania',
          },
        },
      ];

      const sorter = createSorter([
        {
          property: ['address', 'country'],
          direction: 'asc',
        },
      ]);

      const result = sorter(mockItems);
      const resultIDs = result.map((item) => item.id);

      expect(resultIDs).toEqual([5, 4, 1, 2, 3]);
    });
  });

  describe('Attribute path', () => {
    it('can sort by nested attributes', () => {
      const mockItems = [
        {
          type: 'human',
          name: {
            first: 'benjamin',
          },
        },
        {
          type: 'human',
          name: {
            first: 'abigail',
          },
        },
        {
          type: 'human',
          name: {
            first: 'carolyn',
          },
        },
      ];

      const sorter = createSorter([{
        property: ['name', 'first'],
        direction: 'asc',
      }]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name.first);

      const sorter2 = createSorter([{
        property: ['name', 'first'],
        direction: 'desc',
      }]);

      const result2 = sorter2(mockItems);
      const resultNames2 = result2.map((item) => item.name.first);

      expect(resultNames).toEqual(['abigail', 'benjamin', 'carolyn']);
      expect(resultNames2).toEqual(['carolyn', 'benjamin', 'abigail']);
    });
  });

  describe('Special cases', () => {
    it('treats "*" property as fifo/lifo ordering', () => {
      let sorter;
      const mockItems = [
        {
          position: 1,
        },
        {
          position: 2,
        },
        {
          position: 3,
        },
      ];

      sorter = createSorter([{
        property: '*',
        direction: 'asc',
      }]);

      const resultPositionsAsc = sorter(mockItems).map((item) => item.position);

      sorter = createSorter([{
        property: '*',
        direction: 'desc',
      }]);

      const resultPositionsDesc = sorter(mockItems).map((item) => item.position);

      expect(resultPositionsAsc).toEqual([1, 2, 3]);
      expect(resultPositionsDesc).toEqual([3, 2, 1]);
    });

    it('handles values of conflicting types', () => {
      const mockItems = [
        {
          type: 'human',
          name: 'abigail',
        },
        {
          type: 'human',
          name: 'benjamin',
        },
        {
          type: 'robot',
          name: 1,
        },
        {
          type: 'robot',
          name: 2,
        },
      ];

      const sorter = createSorter([
        {
          property: 'name',
          type: 'string',
          direction: 'asc',
        },
      ]);

      const result = sorter(mockItems);
      const resultNames = result.map((item) => item.name);

      expect(resultNames).toEqual(['abigail', 'benjamin', 1, 2]);
    });

    describe('Node Type rules', () => {
      it('handles node type sort rules', () => {
        const mockItems = [
          {
            type: 'human',
            name: 'abigail',
          },
          {
            type: 'animal',
            name: 'cow',
          },
          {
            type: 'human',
            name: 'benjamin',
          },
        ];

        const sorter = createSorter([{
          property: 'type',
          type: 'hierarchy',
          hierarchy: ['human', 'animal'],
        }]);

        const result = sorter(mockItems).map((item) => item.name);
        expect(result).toEqual(['abigail', 'benjamin', 'cow']);
      });

      it('puts missing node types at the end of the list', () => {
        const mockItems = [
          {
            type: 'human',
            name: 'abigail',
          },
          {
            type: 'animal',
            name: 'cow',
          },
          {
            type: 'plant',
            name: 'eugine',
          },
          {
            type: 'human',
            name: 'benjamin',
          },
          {
            type: 'animal',
            name: 'zebra',
          },
        ];

        const sorter = createSorter([{
          property: 'type',
          type: 'hierarchy',
          hierarchy: ['human', 'animal'],
        }]);
        const result = sorter(mockItems).map((item) => item.name);
        expect(result).toEqual(['abigail', 'benjamin', 'cow', 'zebra', 'eugine']);
      });

      it('handles missing hierarchy', () => {
        const mockItems = [
          {
            type: 'animal',
            name: 'zebra',
          },
          {
            type: 'human',
            name: 'abigail',
          },
          {
            type: 'human',
            name: 'benjamin',
          },
          {
            type: 'animal',
            name: 'cow',
          },
          {
            type: 'plant',
            name: 'eucalyptus',
          },
        ];

        const sorter = createSorter([{
          property: 'type',
          type: 'hierarchy',
        }]);
        const result = sorter(mockItems).map((item) => item.name);
        expect(result).toEqual(['zebra', 'abigail', 'benjamin', 'cow', 'eucalyptus']);
      });

      it('combines node type rules with other rules', () => {
        const mockItems = [
          {
            type: 'plant',
            name: 'eucalyptus',
          },
          {
            type: 'human',
            name: 'abigail',
          },
          {
            type: 'animal',
            name: 'cow',
          },
          {
            type: 'human',
            name: 'benjamin',
          },
          {
            type: 'animal',
            name: 'zebra',
          },
        ];

        const sorter = createSorter([
          {
            property: 'type',
            type: 'hierarchy',
            hierarchy: ['human', 'animal', 'plant'],
          },
          {
            property: 'name',
            type: 'string',
            direction: 'asc',
          },
        ]);
        const result = sorter(mockItems).map((item) => item.name);
        expect(result).toEqual(['abigail', 'benjamin', 'cow', 'zebra', 'eucalyptus']);
      });
    });
  });
});
