/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import Pips from '../../Elements/Pips';

describe('Pips component', () => {
  it('renders pips matching count', () => {
    const pips = shallow(<Pips count={3} currentIndex={1} />);

    expect(pips.find('.pips__pip')).toHaveLength(3);
  });

  it('renders pip with active class matching currentIndex', () => {
    const pips = shallow(<Pips count={3} currentIndex={2} />);

    expect(pips.find('.pips__pip').at(2).hasClass('pips__pip--active')).toBe(true);
    expect(pips.find('.pips__pip').at(1).hasClass('pips__pip--active')).toBe(false);
  });
});
