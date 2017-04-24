/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import NodeList from '../../Elements/NodeList';

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow(
      <NodeList>
        <span>foo</span>
      </NodeList>
    );

    expect(component).toMatchSnapshot();
  });

});
