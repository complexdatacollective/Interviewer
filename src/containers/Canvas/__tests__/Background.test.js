/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { Background } from '../Background';

vi.mock('@codaco/ui/lib/utils/CSSVariables');

const sociogramOptionsDefault = {
  layoutVariable: 'foo',
  createEdge: 'bar',
  displayEdges: [],
  canCreateEdge: false,
  canHighlight: false,
  highlightAttributes: {},
  allowHighlighting: false,
  allowPositioning: false,
  selectMode: '',
  sortOrder: [],
  concentricCircles: 0,
  skewedTowardCenter: false,
};

const mockPropsForRadar = {
  ...sociogramOptionsDefault,
  concentricCircles: 4,
  skewedTowardCenter: true,
};

const mockPropsForImage = {
  ...sociogramOptionsDefault,
  image: 'map.png',
};

describe('<SociogramBackground />', () => {
  it('renders ok for radar', () => {
    const component = shallow(<Background {...mockPropsForRadar} />);

    expect(component).toMatchSnapshot();
  });

  it('renders ok for image', () => {
    const component = shallow(<Background {...mockPropsForImage} />);

    expect(component).toMatchSnapshot();
  });
});
