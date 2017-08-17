/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayout } from '../../Elements/NodeLayout';

const mockProps = {
  nodes: [],
  updateNode: () => {},
  toggleEdge: () => {},
  toggleNodeAttributes: () => {},
  width: 123,
  height: 456,
  prompt: {},
};

describe('<NodeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeLayout {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
