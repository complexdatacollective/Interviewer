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
    mockProtocol = { name: 'my-mock-protocol', description: '1.0.1' };
    component = shallow((
      <ProtocolCard
        selectProtocol={selectHandler}
        onDelete={deleteHandler}
        protocol={mockProtocol}
      />
    ));
  });

  it('renders an icon', () => {
    // close button and card icon
    expect(component.find('Icon')).toHaveLength(2);
  });

  it('renders name & description', () => {
    expect(component.text()).toMatch(mockProtocol.name);
    expect(component.text()).toMatch(mockProtocol.description);
  });

  it('downloads on click', () => {
    component.simulate('click');
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });

  it('deletes on click delete', () => {
    const mockEvent = { stopPropagation: () => {}, preventDefault: () => {} };
    component.find('.protocol-card__delete').simulate('click', mockEvent);
    expect(deleteHandler).toHaveBeenCalledTimes(1);
  });
});
