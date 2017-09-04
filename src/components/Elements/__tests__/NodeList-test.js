/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import NodeList from '../../Elements/NodeList';

const mockStore = createStore(() => ({ droppable: { activeZones: [] } }));

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow((
      <NodeList
        store={mockStore}
      />
    ));

    expect(component).toMatchSnapshot();
  });
});
