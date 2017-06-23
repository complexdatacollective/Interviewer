/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import DropZone from '../../Elements/DropZone';

const mockStore = createStore(() => ({ droppable: { activeZones: [] } }));

describe('DropZone component', () => {
  it('renders ok', () => {
    const component = shallow(<DropZone droppableName="foo" store={mockStore} />);

    expect(component).toMatchSnapshot();
  });
});
