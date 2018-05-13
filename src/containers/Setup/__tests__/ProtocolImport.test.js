/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ProtocolImport from '../ProtocolImport';

describe('<ProtocolImport>', () => {
  let component;

  beforeEach(() => {
    component = shallow(<ProtocolImport />);
  });

  it('displays a list of servers', () => {
    expect(component.find('ServerList')).toHaveLength(1);
  });

  it('displays a connected pairing component after a server is selected', () => {
    component.setState({ selectedServer: {} });
    expect(component.find('Connect(ServerPairing)')).toHaveLength(1);
  });
});
