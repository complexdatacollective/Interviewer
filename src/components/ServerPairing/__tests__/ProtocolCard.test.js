/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedProtocolCard as ProtocolCard } from '../ProtocolCard';

describe('<ProtocolCard>', () => {
  let component;
  let mockProtocol;
  let selectHandler;
  let deleteHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    deleteHandler = jest.fn();
    mockProtocol = { name: 'My Mock Protocol', description: 'Protocol description', schemaVersion: 2 };
    component = shallow((
      <ProtocolCard
        selectProtocol={selectHandler}
        protocol={mockProtocol}
        deleteProtocol={deleteHandler}
      />
    ));
  });

  it('renders name & description', () => {
    expect(component.text()).toMatch(mockProtocol.name);
    expect(component.text()).toMatch(mockProtocol.description);
  });

  it('deletes on click delete', () => {
    const mockEvent = { stopPropagation: () => {}, preventDefault: () => {} };
    component.find('.protocol-card__delete').simulate('click', mockEvent);
    expect(deleteHandler).toHaveBeenCalledTimes(1);
  });

  it('starts a session when button is clicked', () => {
    const mockEvent = { stopPropagation: () => {}, preventDefault: () => {} };
    component.find('.start-button').simulate('click', mockEvent);
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
