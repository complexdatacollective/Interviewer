/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { createStore } from 'redux';

import ConnectedPresetSwitcherKey, { PresetSwitcherKey } from '../PresetSwitcherKey';

describe('<PresetSwitcherKey />', () => {
  const props = { open: true };

  it('renders accordions of preset options', () => {
    const subject = shallow(<PresetSwitcherKey {...props} />);
    expect(subject.find('Accordion').length).toBeGreaterThan(1);
  });
});

describe('Connect(PresetSwitcherKey)', () => {
  const mockState = {
    protocol: { codebook: {} },
  };
  const mockProps = {
    displayEdges: [],
    highlights: [],
    subject: {},
  };
  let subject;

  beforeEach(() => {
    const portal = shallow(
      <ConnectedPresetSwitcherKey {...mockProps} store={createStore(() => mockState)} />);
    subject = portal.dive().find('Connect(PresetSwitcherKey)').dive();
  });

  it('provides a convexOptions prop', () => {
    expect(subject.prop('convexOptions')).toBeDefined();
  });

  it('provides an edges prop', () => {
    expect(subject.prop('edges')).toBeDefined();
  });

  it('provides a highlightLabels prop', () => {
    expect(subject.prop('highlightLabels')).toBeDefined();
  });
});
