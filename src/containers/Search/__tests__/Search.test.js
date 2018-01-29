/* eslint-env jest */

import React from 'react';
import { mount, render } from 'enzyme';
import { createStore } from 'redux';

import Search from '../Search';
import SearchResults from '../SearchResults';
import Card from '../../../components/Card';

jest.mock('fuse.js', () => jest.fn(() => (
  {
    // Mock: return one search result when Fuse.search() is called.
    search: jest.fn().mockReturnValue([{ name: 'foo' }]),
  }
)));

const mockReduxState = {
  protocol: {
    externalData: {},
  },
  search: {
    collapsed: false,
  },
};

const mockProps = {
  dataSourceKey: '',
  closeSearch: () => {},
  displayFields: [],
  excludedNodes: [],
  options: {},
  store: createStore(() => mockReduxState),
  onComplete: () => {},
};

describe('<Search />', () => {
  it('renders a search input', () => {
    const component = render(<Search {...mockProps} />);
    expect(component.find('input[type="search"]').length).toBe(1);
  });

  it('renders searchResults', () => {
    const component = mount(<Search {...mockProps} />);
    expect(component.find(SearchResults).length).toBe(1);
  });

  it('populates searchResults', () => {
    const component = mount(<Search {...mockProps} />);
    expect(component.find(Card).length).toBe(0);
    component.find('input[type="search"]').simulate('change', { target: { value: 'query' } });
    expect(component.find(Card).length).toBe(1);
  });
});
