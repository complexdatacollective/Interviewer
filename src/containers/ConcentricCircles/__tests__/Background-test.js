/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { Background } from '../Background';

jest.mock('../../../utils/CSSVariables');

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
  nodeBinSortOrder: {},
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

describe('<SociowgramBackground />', () => {
  it('renders ok for radar', () => {
    const component = shallow(<Background {...mockPropsForRadar} />);

    expect(component).toMatchSnapshot();
  });

  it('renders ok for image', () => {
    const component = shallow(<Background {...mockPropsForImage} />);

    expect(component).toMatchSnapshot();
  });
});
