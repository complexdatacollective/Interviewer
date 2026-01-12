/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';

import React from 'react';
import { shallow } from 'enzyme';

import PresetSwitcher from '../PresetSwitcher';

describe('<PresetSwitcher />', () => {
  const props = { presets: [{}, {}], activePreset: 0 };

  it('renders navigation', () => {
    const subject = shallow(<PresetSwitcher {...props} />);
    expect(subject.dive().find('.preset-switcher__navigation--next')).toHaveLength(1);
  });

  it('handles navigation', () => {
    const handler = vi.fn();
    const subject = shallow(<PresetSwitcher {...props} onChangePreset={handler} />);
    const next = subject.dive().find('.preset-switcher__navigation--next');
    next.simulate('click');
    expect(handler).toHaveBeenCalled();
  });

  it('enables freeze button', () => {
    const handler = vi.fn();
    const subject = shallow(<PresetSwitcher
      {...props}
      shouldShowFreezeButton
      onToggleFreeze={handler}
    />);
    const next = subject.dive().find('.preset-switcher__freeze');
    next.simulate('click');
    expect(handler).toHaveBeenCalled();
    expect(subject.dive().find('.preset-switcher__freeze--active')).toHaveLength(0);
  });

  it('activates freeze button', () => {
    const subject = shallow(<PresetSwitcher {...props} shouldShowFreezeButton isFrozen />);
    expect(subject.dive().find('.preset-switcher__freeze--active')).toHaveLength(1);
  });

  it('hides freeze button', () => {
    const subject = shallow(<PresetSwitcher {...props} shouldShowFreezeButton={false} />);
    expect(subject.dive().find('.preset-switcher__freeze')).toHaveLength(0);
  });
});
