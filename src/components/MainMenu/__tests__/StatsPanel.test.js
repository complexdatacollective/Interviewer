/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import StatsPanel from '../StatsPanel';

describe('StatsPanel component', () => {
  it('delegates click for finish handling', () => {
    const handleFinish = jest.fn();
    const subject = shallow(<StatsPanel onFinishInterview={handleFinish} />);
    subject.find('Button[children="Finish Interview"]').simulate('click');
    expect(handleFinish).toHaveBeenCalled();
  });
});
