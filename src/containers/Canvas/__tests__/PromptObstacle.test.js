/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';

import PromptObstacle from '../PromptObstacle';

describe('PromptObstacle', () => {
  it('renders a prompt obstacle', () => {
    const subject = shallow(<PromptObstacle />);
    expect(subject.dive().find('Connect(PromptSwiper)')).toHaveLength(1);
    expect(subject.instance().updateObstacle).toBeInstanceOf(Function);
  });
});
