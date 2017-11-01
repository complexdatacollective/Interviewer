/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { SociogramBackground } from '../../Elements/SociogramBackground';

const sociogramOptionsDefault = {
  layoutVariable: 'foo',
  createEdge: 'bar',
  displayEdges: [],
  canCreateEdge: false,
  canHighlight: false,
  highlightAttributes: {},
  allowSelect: false,
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
    const component = shallow(<SociogramBackground {...mockPropsForRadar} />);

    expect(component).toMatchSnapshot();
  });

  it('renders ok for image', () => {
    const component = shallow(<SociogramBackground {...mockPropsForImage} />);

    expect(component).toMatchSnapshot();
  });
});
