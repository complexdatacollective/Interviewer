/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { PresetSwitcherKey } from '../PresetSwitcherKey';

describe('<PresetSwitcherKey />', () => {
  const props = { open: true };

  it('renders accordions of preset options', () => {
    const subject = shallow(<PresetSwitcherKey {...props} />);
    expect(subject.find('Accordion').length).toBeGreaterThan(1);
  });
});
