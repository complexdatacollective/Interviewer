/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { EdgeLayout } from '../EdgeLayout';

const mockEdgeCoords = [
  {
    key: 'foo_bar_baz',
    type: 'type',
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
  displayEdges: [],
  layout: 'foo',
  edges: mockEdgeCoords,
};

describe('<EdgeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<EdgeLayout {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
