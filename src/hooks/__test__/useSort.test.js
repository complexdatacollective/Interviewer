/* eslint-disable @codaco/spellcheck/spell-checker */
/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import useSort from '../useSort';

const mockList = [
  {
    id: 1,
    data: {
      name: 'Spock',
      // last_name: '',
    },
  },
  {
    id: 2,
    data: {
      name: 'Nyota',
      last_name: 'Uhura',
    },
  },
  {
    id: 3,
    data: {
      name: 'James',
      last_name: 'Kirk',
    },
  },
  {
    id: 4,
    data: {
      name: 'Montgomery',
      last_name: 'Scott',
    },
  },
];

const sortOrder = {
  property: ['data', 'name'],
  direction: 'desc',
  type: 'string',
};

const TestConsumer = ({ list, initialSortOrder }) => {
  const [
    sortedList,
    sortByProperty,
    sortDirection,
    updateSortByProperty,
    setSortType,
    setSortDirection,
  ] = useSort(
    list,
    initialSortOrder,
  );

  return (
    <div
      useSort={{
        sortedList,
        sortByProperty,
        sortDirection,
        updateSortByProperty,
        setSortType,
        setSortDirection,
      }}
    />
  );
};

describe('useSort', () => {
  it('returns correct interface', () => {
    const subject = mount((
      <TestConsumer
        list={mockList}
        initialSortOrder={sortOrder}
      />
    ));

    const {
      sortedList,
      sortByProperty,
      sortDirection,
      updateSortByProperty,
      setSortDirection,
    } = subject.find('div').prop('useSort');

    expect(sortedList).toBeInstanceOf(Array);
    expect(sortByProperty).toEqual(sortOrder.property);
    expect(sortDirection).toEqual(sortOrder.direction);
    expect(updateSortByProperty).toBeInstanceOf(Function);
    expect(setSortDirection).toBeInstanceOf(Function);
  });

  it('can toggle direction', () => {
    const subject = mount((
      <TestConsumer
        list={mockList}
        initialSortOrder={sortOrder}
      />
    ));

    const {
      sortedList,
      setSortDirection,
      sortDirection: initialSortDirection,
    } = subject.find('div').prop('useSort');

    expect(initialSortDirection).toEqual('desc');

    setSortDirection('asc');

    subject.update();

    const {
      sortedList: reversedSortedList,
      sortDirection,
    } = subject.find('div').prop('useSort');

    expect(sortedList.reverse()).toEqual(reversedSortedList);
    expect(sortDirection).toEqual('asc');
  });

  it('can change sort property', () => {
    const subject = mount((
      <TestConsumer
        list={mockList}
        initialSortOrder={sortOrder}
      />
    ));

    const {
      updateSortByProperty,
    } = subject.find('div').prop('useSort');

    const {
      sortDirection: changedSortDirection,
    } = subject.find('div').prop('useSort');

    expect(changedSortDirection).toEqual('desc');

    updateSortByProperty(['data', 'last_name']);

    subject.update();

    const {
      sortedList,
      sortByProperty,
      sortDirection: resetSortDirection,
    } = subject.find('div').prop('useSort');

    expect(resetSortDirection).toEqual('asc');
    expect(sortByProperty).toEqual(['data', 'last_name']);
    expect(sortedList).toEqual([
      {
        data: {
          last_name: 'Kirk',
          name: 'James',
        },
        id: 3,
      },
      {
        data: {
          last_name: 'Scott',
          name: 'Montgomery',
        },
        id: 4,
      },
      {
        data: {
          last_name: 'Uhura',
          name: 'Nyota',
        },
        id: 2,
      },
      {
        data: {
          name: 'Spock',
        },
        id: 1,
      },
    ]);
  });
});
