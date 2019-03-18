/* eslint-env jest */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import Node, { Node as UnconnectedNode } from '../Node';

const mocksendMessageAsync = jest.fn().mockResolvedValue('');

jest.mock('../../utils/WorkerAgent', () => function MockWorkerAgent() {
  return { sendMessageAsync: mocksendMessageAsync };
});

const mockState = {
  protocol: {
    codebook: {},
  },
};

global.console.warn = jest.fn();

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

  describe('dynamic labeler', () => {
    const flushPromises = () => new Promise(resolve => setImmediate(resolve));

    it('sets a label on state', async () => {
      mocksendMessageAsync.mockResolvedValue('dynamic-label');
      wrapper = shallow(<UnconnectedNode {...props} workerUrl="blob:" />);
      await flushPromises();
      expect(wrapper.state('label')).toEqual('dynamic-label');
    });

    it('sets an error if dynamic label is empty', async () => {
      mocksendMessageAsync.mockResolvedValue('');
      wrapper = shallow(<UnconnectedNode {...props} workerUrl="blob:" />);
      await flushPromises();
      const state = wrapper.state();
      expect(state.label).not.toBeDefined();
      expect(state.workerError).toBeInstanceOf(Error);
      expect(state.workerError).toMatchObject({ message: 'Empty label' });
    });
  });
});
