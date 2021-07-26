/* eslint-env jest */

import React from 'react';
import { mount } from 'enzyme';
import useSort from '../useSort';

const list = [
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

const TestConsumer = (props) => {
  const [
    sortedList,
    sortByProperty,
    sortDirection,
    updateSortByProperty,
    toggleSortDirection,
  ] = useSort(
    props.list,
    props.initialSortOrder,
  );

  return (
    <div
      useSort={{
        sortedList,
        sortByProperty,
        sortDirection,
        updateSortByProperty,
        toggleSortDirection,
      }}
    />
  );
};

describe('useSort', () => {
  it('returns correct interface', () => {
    const initialSortProperty = ['data', 'name'];
    const initialSortDirection = 'desc';
    const subject = mount((
      <TestConsumer
        list={list}
        initialSortOrder={{
          property: initialSortProperty,
          direction: initialSortDirection,
        }}
      />
    ));

    const {
      sortedList,
      sortByProperty,
      sortDirection,
      updateSortByProperty,
      toggleSortDirection,
    } = subject.find('div').prop('useSort');

    expect(sortedList).toBeInstanceOf(Array);
    expect(sortByProperty).toEqual(initialSortProperty);
    expect(sortDirection).toEqual(initialSortDirection);
    expect(updateSortByProperty).toBeInstanceOf(Function);
    expect(toggleSortDirection).toBeInstanceOf(Function);
  });

  it.todo('can toggle direction');
  it.todo('can change sort property');
});
