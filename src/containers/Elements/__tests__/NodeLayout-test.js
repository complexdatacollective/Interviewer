/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayoutPure } from '../NodeLayout';

const mockProps = {
  nodes: [],
  updateNode: () => {},
  toggleEdge: () => {},
  toggleNodeAttributes: () => {},
  width: 123,
  height: 456,
  layout: 'foo',
};

describe('<NodeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeLayoutPure {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
