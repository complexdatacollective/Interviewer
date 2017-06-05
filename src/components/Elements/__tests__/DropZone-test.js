/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import DropZone from '../../Elements/DropZone';

describe('DropZone component', () => {
  it('renders ok', () => {
    const component = shallow(<DropZone droppableName="foo" store={createStore(() => {})} />);

    expect(component).toMatchSnapshot();
  });
});
