/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import ProtocolList from '../ProtocolList';

const mockProps = {
  addSession: jest.fn(),
  loadFactoryProtocol: jest.fn(),
  loadProtocol: jest.fn(),
};

const mockStore = () =>
  createStore(() => ({
    protocols: [{ name: 'Sample', path: 'sample.netcanvas', type: 'factory' }],
  }));

describe('<ProtocolList />', () => {
  it('renders ok', () => {
    const component = shallow(<ProtocolList {...mockProps} store={mockStore()} />);

    expect(component).toMatchSnapshot();
  });
});
