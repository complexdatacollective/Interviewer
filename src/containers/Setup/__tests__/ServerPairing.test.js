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

  it('renders a spinner when first loading', () => {
    expect(component.find('Spinner')).toHaveLength(1);
  });

  it('renders a server card', () => {
    component.setState({ loading: false });
    expect(component.find('ServerCard')).toHaveLength(1);
  });

  it('renders a form after request ID received', () => {
    expect(component.find('ServerPairingForm')).toHaveLength(0);
    component.setState({ loading: false, pairingRequestId: '1' });
    expect(component.find('ServerPairingForm')).toHaveLength(1);
  });
});
