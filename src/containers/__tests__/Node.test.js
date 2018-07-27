/* eslint-env jest */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import Node, { Node as UnconnectedNode } from '../Node';

const mockState = {
  protocol: {
    variableRegistry: {},
  },
};

describe('a connected <Node />', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount((
      <Provider store={createStore(() => mockState)}>
        <Node />
      </Provider>
    ));
  });

  it('renders a Node', () => {
    expect(wrapper.find('Node').length).toBeGreaterThan(0);
  });
});

describe('<Node />', () => {
  let wrapper;
  const props = { getLabel: jest.fn(), type: 'person' };

  beforeEach(() => {
    wrapper = shallow(<UnconnectedNode {...props} />);
  });

  it('initializes a worker if workerUrl is defined', () => {
    expect(wrapper.instance().webWorker).not.toBeDefined();
    wrapper.setProps({ workerUrl: 'blob:file:' });
    expect(wrapper.instance().webWorker).toBeDefined();
  });

  it('cancels any pending messages when unmounting', () => {
    const cancelMessage = jest.fn();
    wrapper.instance().webWorker = { cancelMessage };
    wrapper.instance().outstandingMessage = {};
    expect(cancelMessage).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(cancelMessage).toHaveBeenCalled();
  });
});
