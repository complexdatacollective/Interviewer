/* eslint-env jest */

import React from 'react';
import { mount, render } from 'enzyme';
import { Search } from '../Search';
import SearchResults from '../SearchResults';
import Card from '../../../components/Card';

const mockSearchResult = [{ attributes: { name: 'foo' } }];

jest.mock('../../../ui/utils/CSSVariables');

const mockProps = {
  dataSourceKey: '',
  closeSearch: () => {},
  primaryDisplayField: '',
  excludedNodes: [],
  options: {},
  onComplete: () => {},
  nodeTypeDefinition: {
    variables: {},
  },
  fuse: {
    search: () => mockSearchResult,
  },
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
