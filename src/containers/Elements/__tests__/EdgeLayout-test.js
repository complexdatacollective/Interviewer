/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { EdgeLayout } from '../../Elements/EdgeLayout';

const mockEdgeCoords = [
  {
    key: 'foo_bar_baz',
    from: {
      x: 100,
      y: 100,
    },
    to: {
      x: 100,
      y: 100,
    },
  },
];

const mockProps = {
  stage: {},
  prompt: {},
  edgeCoords: mockEdgeCoords,
};

describe('<EdgeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<EdgeLayout {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
