/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedSetup as SetupScreen } from '../SetupScreen';

describe('<SetupScreen>', () => {
  it('links to protocol import screen', () => {
    const component = shallow((
      <SetupScreen
        downloadProtocol={jest.fn()}
        loadFactoryProtocol={jest.fn()}
        protocolType=""
        isProtocolLoaded={false}
      />
    ));

    const link = component.find('Link');
    expect(link).toHaveLength(1);
    expect(link.prop('to')).toMatch('protocol-import');
  });
});
