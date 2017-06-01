/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import DropZone from '../../Elements/DropZone';

describe('DropZone component', () => {
  it('renders ok', () => {
    const component = shallow(<DropZone label="foo" />);

    expect(component).toMatchSnapshot();
  });
});
