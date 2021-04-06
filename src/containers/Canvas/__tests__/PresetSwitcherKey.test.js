/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedPresetSwitcherKey as PresetSwitcherKey } from '../PresetSwitcherKey';

describe('<PresetSwitcherKey />', () => {
  const props = {
    isOpen: true,
    highlightLabels: ['mock'],
    edges: ['mock'],
    convexOptions: ['mock'],
  };

  it('renders accordions of preset options', () => {
    const subject = shallow(<PresetSwitcherKey {...props} />);
    expect(subject.find('Accordion').length).toEqual(3);
  });

  it('doesnt render an accordion if the option is empty', () => {
    const subject = shallow(<PresetSwitcherKey {...props} highlightLabels={[]} />);
    expect(subject.find('Accordion').length).toEqual(2);
  });
});
