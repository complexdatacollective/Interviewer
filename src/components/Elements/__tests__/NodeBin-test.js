/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import NodeBin from '../../Elements/NodeBin';

describe('NodeBin component', () => {
  it('renders ok', () => {
    const component = shallow(<NodeBin />);

    expect(component).toMatchSnapshot();
  });
});
