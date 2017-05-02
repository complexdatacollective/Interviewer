/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import NodeList from '../../Elements/NodeList';

const network = {
  nodes: [
    {
      name: 'test'
    }
  ]
}

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow(
      <NodeList network={ network } />
    );

    expect(component).toMatchSnapshot();
  });

});
