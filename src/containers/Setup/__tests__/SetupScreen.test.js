/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedSetup as SetupScreen } from '../SetupScreen';

describe('<SetupScreen>', () => {
  it('links to protocol import screen', () => {
    const component = shallow((
      <SetupScreen
        setDeviceDescription={jest.fn()}
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

  it('switches to session view', () => {
    const component = shallow((
      <SetupScreen
        setDeviceDescription={jest.fn()}
        downloadProtocol={jest.fn()}
        loadFactoryProtocol={jest.fn()}
        protocolType=""
        isProtocolLoaded={false}
      />
    ));

    expect(component.find('.setup__link').at(0).hasClass('setup__link--active'));
    expect(component.find('.setup__link').at(1).hasClass('setup__link--active')).toBe(false);
    component.find('.setup__link').at(1).simulate('click');
    expect(component.find('.setup__link').at(0).hasClass('setup__link--active')).toBe(false);
    expect(component.find('.setup__link').at(1).hasClass('setup__link--active'));
  });
});
