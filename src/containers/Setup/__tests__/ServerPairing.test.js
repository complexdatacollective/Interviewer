/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import ConnectedServerPairing, { UnconnectedServerPairing as ServerPairing } from '../ServerPairing';

describe('<ServerPairing>', () => {
  let component;
  const mockDownloadFn = jest.fn();
  const protocolType = '';
  const mockServer = { pairingServiceUrl: 'http://example.com:1234' };

  beforeEach(() => {
    component = shallow((
      <ServerPairing
        downloadProtocol={mockDownloadFn}
        protocolType={protocolType}
        isProtocolLoaded={false}
        server={mockServer}
      />
    ));
  });

  it('renders a server card', () => {
    expect(component.find('ServerSetup')).toHaveLength(1);
  });

  it('renders a pairing form', () => {
    expect(component.find('ServerPairingForm')).toHaveLength(1);
  });

  it('sets a loading state on the form', () => {
    expect(component.find('ServerPairingForm').prop('loading')).toBe(true);
  });

  it('tells form to stop loading', () => {
    component.setState({ loading: false, pairingRequestId: '1' });
    expect(component.find('ServerPairingForm').prop('loading')).toBe(false);
  });
});

describe('Connect(ServerPairing)', () => {
  let mockStore;
  let subject;
  beforeEach(() => {
    mockStore = createStore(() => ({ deviceSettings: { description: 'mockdevice' }, protocol: {} }));
    subject = shallow(<ConnectedServerPairing store={mockStore} />);
  });

  it('renders the component', () => {
    expect(subject.find('ServerPairing')).toHaveLength(1);
  });

  it('provides a device description', () => {
    expect(subject.prop('deviceName')).toEqual('mockdevice');
  });
});
