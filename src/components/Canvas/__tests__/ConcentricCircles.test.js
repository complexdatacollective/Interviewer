/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import { ConcentricCircles } from '../ConcentricCircles';

jest.mock('../../../containers/Canvas/ConvexHulls', () => 'mockConvexHullsContainer');
jest.mock('../../../containers/Canvas/EdgeLayout', () => 'mockEdgeLayoutContainer');

describe('<ConcentricCircles />', () => {
  let props;
  beforeEach(() => {
    props = { subject: {}, layoutVariable: '' };
  });

  it('renders a Canvas', () => {
    expect(shallow(<ConcentricCircles {...props} />).find('Canvas')).toHaveLength(1);
  });

  it('renders a ConvexHulls container when hulls given', () => {
    const subject = shallow(<ConcentricCircles {...props} convexHulls={[]} />);
    expect(subject.find('mockConvexHullsContainer')).toHaveLength(1);
  });

  it('renders an EdgeLayout container when edges given', () => {
    const subject = shallow(<ConcentricCircles {...props} displayEdges={[{}]} />);
    expect(subject.find('mockEdgeLayoutContainer')).toHaveLength(1);
  });
});
