/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */
import { entityAttributesProperty } from '@codaco/shared-consts';
import createSorter, { processProtocolSortRule } from '../createSorter';

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

  const sorter2 = createSorter([]);
  expect(sorter2(mockItems)).toMatchObject(mockItems);
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

describe('Types', () => {
  it('orders numerical values numerically', () => {
    const mockItems = [
      {
        age: 20,
      },
      {
        age: 30,
      },
      {
        // age: 10, - missing
      },
      {
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

    let sorter;

    sorter = createSorter([{
      property: 'birthdate',
      type: 'date',
      direction: 'asc',
    }]);
    const result = sorter(mockItems);
    const resultBirthdates = result.map((item) => item.birthdate);

    expect(resultBirthdates).toEqual(['1970-01-01', '1980-01-01', '1990-01-01']);

    sorter = createSorter([{
      property: 'birthdate',
      type: 'date',
      direction: 'desc',
    }]);

    const result2 = sorter(mockItems);
    const result2Birthdates = result2.map((item) => item.birthdate);
    expect(result2Birthdates).toEqual(['1990-01-01', '1980-01-01', '1970-01-01']);
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
      type: 'boolean',
      direction: 'desc',
    }]);
    const result2 = sorter2(mockItems);
    const resultNames2 = result2.map((item) => item.name);

    expect(resultNames2).toEqual(['abigail', 'carolyn', 'benjamin']);
  });

  describe('Hierarchy rules', () => {
    it('sorts numerical hierarchy', () => {
      const mockItems = [
        {
          ordinal: 1,
          name: 'abigail',
        },
        {
          ordinal: 2,
          name: 'benjamin',
        },
        {
          ordinal: 3,
          name: 'carolyn',
        },
        {
          ordinal: 4,
          name: 'daniel',
        },
        {
          ordinal: -1,
          name: 'eugine',
        },
      ];

      const sorter = createSorter([{
        property: 'ordinal',
        type: 'hierarchy',
        hierarchy: [4, 3, 2, 1, -1],
      }]);

      const result = sorter(mockItems).map((item) => item.name);
      expect(result).toEqual(['daniel', 'carolyn', 'benjamin', 'abigail', 'eugine']);
    });

    it('multiple hierarchies', () => {
      const mockItems = [
        {
          type: 'human',
          name: 'abigail',
          ordinal: 1,
        },
        {
          type: 'animal',
          name: 'aardvark',
        },
        {
          type: 'human',
          name: 'benjamin',
          ordinal: 2,
        },
        {
          type: 'animal',
          name: 'cow',
        },
        {
          type: 'plant',
          name: 'eucalyptus',
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
          hierarchy: ['human', 'animal'],
        },
        {
          property: 'ordinal',
          type: 'hierarchy',
          hierarchy: [2, 1],
        },
        {
          property: 'name',
          type: 'string',
          direction: 'asc',
        },
      ]);

      const result = sorter(mockItems).map((item) => item.name);

      expect(result).toEqual(['benjamin', 'abigail', 'aardvark', 'cow', 'zebra', 'eucalyptus']);
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

    it('sorts hierarchies ascending or descending', () => {
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
        hierarchy: ['human', 'animal'],
      }]);
      const result = sorter(mockItems).map((item) => item.name);
      expect(result).toEqual(['abigail', 'benjamin', 'zebra', 'cow', 'eucalyptus']);

      const sorter2 = createSorter([{
        property: 'type',
        type: 'hierarchy',
        direction: 'asc',
        hierarchy: ['human', 'animal'],
      }]);
      const result2 = sorter2(mockItems).map((item) => item.name);
      expect(result2).toEqual(['zebra', 'cow', 'abigail', 'benjamin', 'eucalyptus']);
    });
  });
});

describe('Categorical sorting', () => {
  it('sorts items based on categorical values', () => {
    const mockItems = [
      {
        category: ['cow'],
        name: 'alice',
      },
      {
        category: ['duck'],
        name: 'bob',
      },
      {
        category: ['lizard'],
        name: 'charlie',
      },
      {
        category: ['cow'],
        name: 'david',
      },
    ];

    const sorter = createSorter([
      {
        property: 'category',
        type: 'categorical',
        hierarchy: ['duck', 'lizard', 'cow'],
      },
      {
        property: 'name',
        type: 'string',
        direction: 'asc',
      },
    ]);

    const result = sorter(mockItems).map((item) => item.name);
    expect(result).toEqual(['alice', 'david', 'charlie', 'bob']);
  });

  it('handles items with multiple categories', () => {
    const mockItems = [
      {
        category: ['duck', 'lizard'],
        name: 'alice',
      },
      {
        category: ['cow', 'duck'],
        name: 'bob',
      },
      {
        category: ['cow'],
        name: 'charlie',
      },
      {
        category: ['lizard'],
        name: 'david',
      },
    ];

    const sorter = createSorter([
      {
        property: 'category',
        type: 'categorical',
        hierarchy: ['cow', 'duck', 'lizard'],
      },
      {
        property: 'name',
        type: 'string',
        direction: 'asc',
      },
    ]);

    const result = sorter(mockItems).map((item) => item.name);
    expect(result).toEqual(['david', 'alice', 'bob', 'charlie']);
  });

  it('handles missing categories', () => {
    const mockItems = [
      {
        name: 'alice',
      },
      {
        category: ['duck'],
        name: 'bob',
      },
      {
        category: ['lizard'],
        name: 'charlie',
      },
      {
        name: 'david',
      },
    ];

    const sorter = createSorter([
      {
        property: 'category',
        type: 'categorical',
        hierarchy: ['lizard', 'duck', 'cow'],
      },
      {
        property: 'name',
        type: 'string',
        direction: 'asc',
      },
    ]);

    const result = sorter(mockItems).map((item) => item.name);
    expect(result).toEqual(['bob', 'charlie', 'alice', 'david']);
  });
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
      type: 'string',
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
      type: 'string',
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
        type: 'number',
        direction: 'asc',
      },
      {
        property: 'name',
        type: 'string',
        direction: 'desc',
      },
    ]);

    const result = sorter(mockItems);
    const resultNames = result.map((item) => item.name);

    expect(resultNames).toEqual(['timmy', 'eugine', 'richard', 'carolyn', 'benjamin', 'abigail']);
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
        type: 'string',
        direction: 'desc',
      },
      {
        property: 'missingAttribute',
        type: 'number',
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
        type: 'string',
        direction: 'asc',
      },
    ]);

    const resultNamesAsc = sorter(mockItems).map((item) => item.name);
    expect(resultNamesAsc).toEqual(['abigail', 'benjamin', undefined]);

    sorter = createSorter([
      {
        property: 'name',
        type: 'string',
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
        type: 'string',
        direction: 'asc',
      },
    ]);

    const resultIDsAsc = sorter(mockItems).map((item) => item.id);
    expect(resultIDsAsc).toEqual([1, 2, 3, 4, 5]);

    sorter = createSorter([
      {
        property: 'name',
        type: 'string',
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
        type: 'string',
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
      type: 'string',
      direction: 'asc',
    }]);

    const result = sorter(mockItems);
    const resultNames = result.map((item) => item.name.first);

    const sorter2 = createSorter([{
      property: ['name', 'first'],
      type: 'string',
      direction: 'desc',
    }]);

    const result2 = sorter2(mockItems);
    const resultNames2 = result2.map((item) => item.name.first);

    expect(resultNames).toEqual(['abigail', 'benjamin', 'carolyn']);
    expect(resultNames2).toEqual(['carolyn', 'benjamin', 'abigail']);
  });

  it('can sort very deeply nested attributes', () => {
    const mockItems = [
      {
        type: 'human',
        name: {
          first: 'benjamin',
          middle: {
            initial: 'b',
          },
        },
      },
      {
        type: 'human',
        name: {
          first: 'abigail',
          middle: {
            initial: 'a',
          },
        },
      },
      {
        type: 'human',
        name: {
          first: 'carolyn',
          middle: {
            initial: 'c',
          },
        },
      },
    ];

    const sorter = createSorter([{
      property: ['name', 'middle', 'initial'],
      direction: 'asc',
    }]);

    const result = sorter(mockItems);
    const resultNames = result.map((item) => item.name.first);

    const sorter2 = createSorter([{
      property: ['name', 'middle', 'initial'],
      direction: 'desc',
    }]);

    const result2 = sorter2(mockItems);
    const resultNames2 = result2.map((item) => item.name.first);

    expect(resultNames).toEqual(['abigail', 'benjamin', 'carolyn']);
    expect(resultNames2).toEqual(['carolyn', 'benjamin', 'abigail']);
  });
});

describe('Special cases', () => {
  it('handles strings with extended latin characters', () => {
    const mockItems = [
      { name: 'a' },
      { name: 'A' },
      { name: 'ä' },
      { name: 'á' },
      { name: 'â' },
    ];
    const sorter = createSorter([{
      property: 'name',
      direction: 'asc',
      type: 'string',
    }]);

    const sorted = sorter(mockItems).map((item) => item.name);

    expect(sorted).toEqual(['a', 'A', 'á', 'â', 'ä']);
  });

  it.todo('Handles paths with array notation');
  it.todo('Handles paths with array indexes');

  describe('Node type rules', () => {
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
  });

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
});

describe('processProtocolSortRule', () => {
  it('ignores rules that already have a type', () => {
    const rule = {
      property: 'name',
      type: 'string',
      direction: 'asc',
    };
    expect(processProtocolSortRule()(rule)).toEqual(rule);
  });

  it('ignores rules where the property is not in the codebook', () => {
    const rule = {
      property: 'name',
      direction: 'asc',
    };
    expect(processProtocolSortRule()(rule)).toEqual(rule);
  });

  describe('manages property path', () => {
    it('adds entityAttributes property to the property path', () => {
      const rule = {
        property: 'name',
        direction: 'asc',
      };

      const codebookVariables = { name: { type: 'string' } };
      const result = processProtocolSortRule(codebookVariables)(rule);
      expect(result.property).toEqual([entityAttributesProperty, 'name']);
    });

    it('does not modify rules where property equals type', () => {
      const rule = {
        property: 'type',
        direction: 'asc',
      };

      const codebookVariables = { type: { type: 'string' } };
      const result = processProtocolSortRule(codebookVariables)(rule);
      expect(result.property).toEqual('type');
    });
  });

  describe('adds a type property to the rule based on the codebook variable type', () => {
    const codebookVariables = {
      name: { type: 'text' },
      age: { type: 'number' },
      date: { type: 'datetime' },
      isAlive: { type: 'boolean' },
      category: {
        type: 'categorical',
        options: [
          {
            label: 'One',
            value: 'one',
          },
          {
            label: 'Two',
            value: 'two',
          },
        ],
      },
      order: {
        type: 'ordinal',
        options: [
          {
            label: 'One',
            value: 'one',
          },
          {
            label: 'Two',
            value: 'two',
          },
        ],
      },
      scale: { type: 'scalar' },
      layout: { type: 'layout' },
    };

    it('ignores fifo (*) rules', () => {
      const rule = {
        property: '*',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule)).toEqual(rule);
    });

    it('string', () => {
      const rule = {
        property: 'name',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('string');
    });

    it('number', () => {
      const rule = {
        property: 'age',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('number');
    });

    it('datetime', () => {
      const rule = {
        property: 'date',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('date');
    });

    it('boolean', () => {
      const rule = {
        property: 'isAlive',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('boolean');
    });

    it('categorical', () => {
      const rule = {
        property: 'category',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('categorical');
    });

    it('ordinal', () => {
      const rule = {
        property: 'order',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('hierarchy');
    });

    it('scalar', () => {
      const rule = {
        property: 'scale',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('number');
    });

    it('layout', () => {
      const rule = {
        property: 'layout',
        direction: 'asc',
      };
      expect(processProtocolSortRule(codebookVariables)(rule).type).toEqual('string');
    });
  });

  it('processProtocolSortRule provides compatibility with existing rules', () => {
    const mockItems = [
      {
        type: 'person_node_type',
        stageId: 'namegen1a',
        _uid: '0e09311ce13248772645155bd78705e2636f8f15',
        itemType: 'NEW_NODE',
        attributes: {
          name_variable: 'Albert',
          '0ff25001-a2b8-46de-82a9-53143aa00d10': null,
          'c5fee926-855d-4419-b5bb-54e89010cea6': 49,
          '0e75ec18-2cb1-4606-9f18-034d28b07c19': 'Albert',
          'ae44b6ba-ad49-4ecf-bf38-b65decfce000': null,
          '94e2dee9-1c25-4b64-b8bb-4946465c3c07': null,
          'ec5b462e-a033-4cbc-8b73-82d90938ec82': null,
          '03b03617-46ae-41cb-9462-9acd8a17edd6': null,
          '1096204b-48fe-444c-b642-4ab211f7f57c': null,
          '23c5a7b9-b553-4ff1-b515-6a81999773d2': null,
          'e343a91f-628d-4175-870c-957beffa0152': null,
          'e343a91f-628d-4175-870c-957beffa0153': null,
          'e343a91f-628d-4175-870c-957beffa0154': null,
          'e343a91f-628d-4175-870c-957beffa0151': null,
          '4ccba4e2-a246-46ee-a3ff-1c70fb4c449c': null,
          layout_variable: null,
          layout_variable_manual: null,
          'e13ca72d-aefe-4f48-841d-09f020e0e987': null,
          'd2d8091e-8170-42c1-9dc0-c0d54553b3e6': null,
          '04298634-eb5f-450a-84dd-95d2708e10c1': null,
          '490db003-3289-4969-b426-919cefb4cdf0': null,
          '9b56bc6d-6b20-4e38-9aab-4057e78e1130': null,
          '246c4d84-ebd7-41a6-8c1a-ef83938227ba': null,
          '979c9ad7-74cb-402d-8574-3f0a91c9174d': null,
          'e1dda563-f6f6-47b7-91cb-31b4c2fdb73a': null,
        },
        promptIDs: [
          '2wedwee',
        ],
      },
      {
        type: 'person_node_type',
        stageId: 'namegen1a',
        _uid: '5b909d77cee1b8d8bcb44562f4c736aaf9bb3868',
        itemType: 'NEW_NODE',
        attributes: {
          name_variable: 'Benjamin',
          '0ff25001-a2b8-46de-82a9-53143aa00d10': null,
          'c5fee926-855d-4419-b5bb-54e89010cea6': 67,
          '0e75ec18-2cb1-4606-9f18-034d28b07c19': 'Benjamin',
          'ae44b6ba-ad49-4ecf-bf38-b65decfce000': null,
          '94e2dee9-1c25-4b64-b8bb-4946465c3c07': null,
          'ec5b462e-a033-4cbc-8b73-82d90938ec82': null,
          '03b03617-46ae-41cb-9462-9acd8a17edd6': null,
          '1096204b-48fe-444c-b642-4ab211f7f57c': null,
          '23c5a7b9-b553-4ff1-b515-6a81999773d2': null,
          'e343a91f-628d-4175-870c-957beffa0152': null,
          'e343a91f-628d-4175-870c-957beffa0153': null,
          'e343a91f-628d-4175-870c-957beffa0154': null,
          'e343a91f-628d-4175-870c-957beffa0151': null,
          '4ccba4e2-a246-46ee-a3ff-1c70fb4c449c': null,
          layout_variable: null,
          layout_variable_manual: null,
          'e13ca72d-aefe-4f48-841d-09f020e0e987': null,
          'd2d8091e-8170-42c1-9dc0-c0d54553b3e6': null,
          '04298634-eb5f-450a-84dd-95d2708e10c1': null,
          '490db003-3289-4969-b426-919cefb4cdf0': null,
          '9b56bc6d-6b20-4e38-9aab-4057e78e1130': null,
          '246c4d84-ebd7-41a6-8c1a-ef83938227ba': null,
          '979c9ad7-74cb-402d-8574-3f0a91c9174d': null,
          'e1dda563-f6f6-47b7-91cb-31b4c2fdb73a': null,
        },
        promptIDs: [
          '2wedwee',
        ],
      },
      {
        type: 'person_node_type',
        stageId: 'namegen1a',
        _uid: '41ecadb17067e2eecc58ce735d9036705db15900',
        itemType: 'NEW_NODE',
        attributes: {
          name_variable: 'Charlie',
          '0ff25001-a2b8-46de-82a9-53143aa00d10': null,
          'c5fee926-855d-4419-b5bb-54e89010cea6': 32,
          '0e75ec18-2cb1-4606-9f18-034d28b07c19': 'Charlie',
          'ae44b6ba-ad49-4ecf-bf38-b65decfce000': null,
          '94e2dee9-1c25-4b64-b8bb-4946465c3c07': null,
          'ec5b462e-a033-4cbc-8b73-82d90938ec82': null,
          '03b03617-46ae-41cb-9462-9acd8a17edd6': null,
          '1096204b-48fe-444c-b642-4ab211f7f57c': null,
          '23c5a7b9-b553-4ff1-b515-6a81999773d2': null,
          'e343a91f-628d-4175-870c-957beffa0152': null,
          'e343a91f-628d-4175-870c-957beffa0153': null,
          'e343a91f-628d-4175-870c-957beffa0154': null,
          'e343a91f-628d-4175-870c-957beffa0151': null,
          '4ccba4e2-a246-46ee-a3ff-1c70fb4c449c': null,
          layout_variable: null,
          layout_variable_manual: null,
          'e13ca72d-aefe-4f48-841d-09f020e0e987': null,
          'd2d8091e-8170-42c1-9dc0-c0d54553b3e6': null,
          '04298634-eb5f-450a-84dd-95d2708e10c1': null,
          '490db003-3289-4969-b426-919cefb4cdf0': null,
          '9b56bc6d-6b20-4e38-9aab-4057e78e1130': null,
          '246c4d84-ebd7-41a6-8c1a-ef83938227ba': null,
          '979c9ad7-74cb-402d-8574-3f0a91c9174d': null,
          'e1dda563-f6f6-47b7-91cb-31b4c2fdb73a': null,
        },
        promptIDs: [
          '2wedwee',
        ],
      },
      {
        type: 'venue_node_type',
        stageId: 'namegen2',
        _uid: 'ea3bebf8-4c3b-419b-a998-05db3e2a936a',
        attributes: {
          name_variable: 'One',
          '7316d500-6c1e-4188-a531-b2ef587721e0': null,
          venueVisitFreqVariable: 1,
          '55f1fbbe-2fe5-42a7-88fb-9a8e5e659d2f': true,
          '8a35cd77-7bc4-4c7e-b98a-673b6a21321f': null,
          '8ee3a187-d4be-458e-8abb-71efcc071949': null,
          '1e9ce62c-44c5-484d-9c26-0d20cc7d7238': null,
          '18fbc928-d027-42de-bc96-ff5c09bf4944': null,
          '67132d2b-c371-4c57-a5eb-6520083f9d22': null,
          'bdc60147-fe7a-4c3c-a164-e5b370f6a281': null,
          '931a7b23-e433-4e7e-8e13-48b72e5f0549': null,
          '0a5f7952-a9a7-4e87-9353-2d17a59284ee': null,
          venue_layout_variable: null,
          venue_layout_variable_manual: null,
        },
        promptIDs: [
          '6cl',
        ],
      },
      {
        type: 'venue_node_type',
        stageId: 'namegen2',
        _uid: '3e7ee30a-9b6d-4e35-a721-9d8bec70b6e4',
        attributes: {
          name_variable: 'Two',
          '7316d500-6c1e-4188-a531-b2ef587721e0': null,
          venueVisitFreqVariable: 3,
          '55f1fbbe-2fe5-42a7-88fb-9a8e5e659d2f': true,
          '8a35cd77-7bc4-4c7e-b98a-673b6a21321f': null,
          '8ee3a187-d4be-458e-8abb-71efcc071949': null,
          '1e9ce62c-44c5-484d-9c26-0d20cc7d7238': null,
          '18fbc928-d027-42de-bc96-ff5c09bf4944': null,
          '67132d2b-c371-4c57-a5eb-6520083f9d22': null,
          'bdc60147-fe7a-4c3c-a164-e5b370f6a281': null,
          '931a7b23-e433-4e7e-8e13-48b72e5f0549': null,
          '0a5f7952-a9a7-4e87-9353-2d17a59284ee': null,
          venue_layout_variable: null,
          venue_layout_variable_manual: null,
        },
        promptIDs: [
          '6cl',
        ],
      },
      {
        type: 'venue_node_type',
        stageId: 'namegen2',
        _uid: '5fd6cb24-281c-46d0-af18-033c0fe85879',
        attributes: {
          name_variable: 'Three',
          '7316d500-6c1e-4188-a531-b2ef587721e0': null,
          venueVisitFreqVariable: 4,
          '55f1fbbe-2fe5-42a7-88fb-9a8e5e659d2f': true,
          '8a35cd77-7bc4-4c7e-b98a-673b6a21321f': null,
          '8ee3a187-d4be-458e-8abb-71efcc071949': null,
          '1e9ce62c-44c5-484d-9c26-0d20cc7d7238': null,
          '18fbc928-d027-42de-bc96-ff5c09bf4944': null,
          '67132d2b-c371-4c57-a5eb-6520083f9d22': null,
          'bdc60147-fe7a-4c3c-a164-e5b370f6a281': null,
          '931a7b23-e433-4e7e-8e13-48b72e5f0549': null,
          '0a5f7952-a9a7-4e87-9353-2d17a59284ee': null,
          venue_layout_variable: null,
          venue_layout_variable_manual: null,
        },
        promptIDs: [
          '6cl',
        ],
      },
    ];

    const rules = [
      {
        property: 'type',
        type: 'hierarchy',
        hierarchy: [
          'venue_node_type',
          'person_node_type',
        ],
      },
      {
        property: 'venueVisitFreqVariable',
        direction: 'desc',
      },
      {
        property: 'name_variable',
        direction: 'asc',
      },
    ];

    const codebookVariables = {
      name_variable: {
        type: 'string',
      },
      venueVisitFreqVariable: {
        entity: 'node',
        entityType: 'venue_node_type',
        name: 'visitfreq',
        type: 'ordinal',
        options: [
          {
            label: 'Every day',
            value: 4,
          },
          {
            label: 'Every other day',
            value: 3,
          },
          {
            label: 'Every week',
            value: 2,
          },
          {
            label: 'Sometimes',
            value: 1,
          },
          {
            label: 'Never',
            value: -1,
          },
        ],
      },
    };

    const processedRules = rules.map(processProtocolSortRule(codebookVariables));
    const sorter = createSorter(processedRules);

    const sorted = sorter(mockItems).map((item) => item.attributes.name_variable);
    expect(sorted).toEqual([
      'Three',
      'Two',
      'One',
      'Albert',
      'Benjamin',
      'Charlie',
    ]);
  });
});
