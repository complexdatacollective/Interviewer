/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import PairingCodeInput from '../PairingCodeInput';
import { PairingCodeLength } from '../../../utils/shared-api/pairingCodeConfig';

describe('<PairingCodeInput>', () => {
  const charCount = PairingCodeLength;
  let component;
  let changeHandler;

  beforeEach(() => {
    changeHandler = jest.fn();
    component = shallow(<PairingCodeInput charCount={charCount} setPairingCode={changeHandler} />);
  });

  it('renders an input for each char', () => {
    expect(component.find('CharInput')).toHaveLength(charCount);
  });

  describe('change event', () => {
    let mockEvent;
    beforeEach(() => {
      mockEvent = {
        currentTarget: {
          getAttribute: () => 0,
          value: 'a',
        },
      };
    });

    it('updates state', () => {
      component.instance().onChange(mockEvent);
      expect(component.state('characters')[0]).toEqual('a');
    });
  });
});
