/* eslint-env jest */

import React from 'react';
import { createStore } from 'redux';
import { shallow } from 'enzyme';
import NodeList from '../../Elements/NodeList';

const mockStore = createStore(() => ({ droppable: { activeZones: [] } }));

const network = {
  nodes: [
    {
      name: 'test',
    },
  ],
};

describe('NodeList component', () => {
  it('renders ok', () => {
    const component = shallow((
      <NodeList
        network={network}
        store={mockStore}
      />
    ));

    expect(component).toMatchSnapshot();
  });
});
