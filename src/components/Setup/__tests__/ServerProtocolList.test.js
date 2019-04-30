/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerProtocolList from '../ServerProtocolList';

describe('<ServerProtocolList>', () => {
  let component;
  let mockProtocols;
  let downloadHandler;

  beforeEach(() => {
    downloadHandler = jest.fn();
    mockProtocols = [{ name: 'my-mock-protocol', version: '1.0.1' }];
    component = shallow((
      <ServerProtocolList selectProtocol={downloadHandler} protocols={mockProtocols} />
    ));
  });

  it('renders a card for each protocol', () => {
    expect(component.find('ProtocolCardMini')).toHaveLength(mockProtocols.length);
  });
});
