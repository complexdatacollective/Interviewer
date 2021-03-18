/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedPresetSwitcherKey as PresetSwitcherKey } from '../PresetSwitcherKey';

describe('<PresetSwitcherKey />', () => {
  const props = {
    isOpen: true,
    highlightLabels: [],
    edges: [],
    convexOptions: [],
  };

  it('renders accordions of preset options', () => {
    const subject = shallow(<PresetSwitcherKey {...props} />);
    expect(subject.find('Accordion').length).toBeGreaterThan(1);
  });
});
