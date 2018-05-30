/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ProtocolCardList from '../ProtocolCardList';

describe('<ProtocolCardList>', () => {
  let component;
  let mockProtocols;
  let downloadHandler;

  beforeEach(() => {
    downloadHandler = jest.fn();
    mockProtocols = [{ name: 'my-mock-protocol', version: '1.0.1' }];
    component = shallow(<ProtocolCardList download={downloadHandler} protocols={mockProtocols} />);
  });

  it('renders a card for each protocol', () => {
    expect(component.find('ProtocolCard')).toHaveLength(mockProtocols.length);
  });
});
