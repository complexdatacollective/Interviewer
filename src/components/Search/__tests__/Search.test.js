/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import Search from '../Search';
// import SearchResults

vi.mock('@codaco/ui/lib/utils/CSSVariables');

const mockSearchResult = [{ attributes: { name: 'foo' } }];

const mockProps = {
  isOpen: false,
  nodeColor: '',
  nodeIconName: '',
  isLoading: false,
  hasSearchTerm: false,
  searchTerm: '',
  awaitingResults: false,
  searchResults: [],
  selectedResults: [],
  getCardTitle: () => {},
  getDetails: () => {},
  getIsSelected: () => {},
  onToggleSearch: () => {},
  onClose: () => {},
  onCommit: () => {},
  onQueryChange: () => {},
  onSelectResult: () => {},
};

describe('<Search />', () => {
  it('renders a search input', () => {
    const component = shallow(<Search {...mockProps} />);
    expect(component.find('input[type="search"]').length).toBe(1);
  });

  it('renders searchResults', () => {
    const component = shallow(<Search {...mockProps} />);
    expect(component.find('SearchResults').length).toBe(1);
  });

  it('populates searchResults', () => {
    const component = shallow((
      <Search
        {...mockProps}
        searchResults={mockSearchResult}
      />
    ));

    expect(component.find('SearchResults').prop('results').length).toBe(1);
  });
});
