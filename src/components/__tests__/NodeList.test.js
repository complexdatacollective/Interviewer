/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import NodeList from '../NodeList';

const mockStore = createStore(() => (
  { droppable: { activeZones: [] }, draggable: { draggingFromIds: {} } }
));

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow((
      <NodeList
        id="foo"
        store={mockStore}
      />
    ));

    expect(component).toMatchSnapshot();
  });
});
