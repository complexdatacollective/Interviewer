/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedServerPairing as ServerPairing } from '../ServerPairing';

describe('<ServerPairing>', () => {
  let component;
  const mockDownloadFn = jest.fn();
  const protocolType = '';
  const mockServer = { apiUrl: '' };

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
