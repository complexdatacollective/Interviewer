/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import Radar from '../Radar';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

const mockProps = {
  n: 5,
  skewed: true,
};

describe('<Radar />', () => {
  it('renders ok', () => {
    const component = shallow(<Radar {...mockProps} />);
    expect(component).toMatchSnapshot();
  });

  describe('circle background', () => {
    it('is lenient with input type', () => {
      const component = shallow(<Radar {...{ ...mockProps, n: '10' }} />);
      expect(component.find('circle')).toHaveLength(10);
    });

    it('is hidden when n is 0', () => {
      const component = shallow(<Radar {...{ ...mockProps, n: 0 }} />);
      expect(component.find('circle')).toHaveLength(0);
    });

    it('is hidden when n is NaN', () => {
      const component = shallow(<Radar {...{ ...mockProps, n: 'a' }} />);
      expect(component.find('circle')).toHaveLength(0);
    });
  });
});
