/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ServerCard from '../ServerCard';

describe('<ServerCard>', () => {
  let serverData;
  let component;
  let selectHandler;

  beforeEach(() => {
    selectHandler = jest.fn();
    serverData = {
      name: 'MyInstance',
      addresses: ['10.1.x.x'],
    };
    component = shallow(<ServerCard data={serverData} selectServer={selectHandler} />);
  });

  it('renders the server name', () => {
    expect(component.text()).toMatch(serverData.name);
  });

  it('renders address if name unavailable', () => {
    component = shallow(<ServerCard data={{ ...serverData, name: null }} />);
    expect(component.text()).toMatch(serverData.addresses[0]);
  });

  it('allows selection', () => {
    component.simulate('click');
    expect(selectHandler).toHaveBeenCalledTimes(1);
  });
});
