/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';
import { UnconnectedCategoricalList as CategoricalList } from '../CategoricalList';
import { UnconnectedCategoricalItem as CategoricalItem } from '../../components/CategoricalItem';

const mockProps = {
  bins: [{ label: 'one', value: 1, nodes: [1, 2, 3] }, { label: 'two', value: 2, nodes: [4, 5] }],
  stage: { id: 1 },
  prompt: { id: 1 },
};

describe('CategoricalList component', () => {
  it('renders categorical list', () => {
    const component = shallow(
      <CategoricalList {...mockProps} />,
    );

    expect(component).toMatchSnapshot();
  });

  it('items match the number of bins', () => {
    const component = mount(
      <CategoricalList {...mockProps} />,
    );

    expect(component.find(CategoricalItem)).toHaveLength(2);
  });
});
