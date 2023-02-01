/* eslint-env jest */

import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { CategoricalList } from '../CategoricalList';
import { CategoricalListItem } from '../CategoricalListItem';

const mockStore = {
  getState: () => ({
  }),
  subscribe: () => ({
  }),
};

const mockProps = {
  bins: [{ label: 'one', value: 1, nodes: [1, 2, 3] }, { label: 'two', value: 2, nodes: [4, 5] }],
  stage: { id: 1 },
  prompt: { id: 1 },
  getNodeLabel: () => 'label',
  nodeColor: '',
  expandedBinValue: '',
};

describe('CategoricalList component', () => {
  it('renders categorical list', () => {
    const component = shallow(
      <CategoricalList {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('items match the number of bins', () => {
    const component = mount((
      <Provider store={mockStore}>
        <CategoricalList {...mockProps} />
      </Provider>
    ));

    expect(component.find(CategoricalListItem)).toHaveLength(2);
  });
});
