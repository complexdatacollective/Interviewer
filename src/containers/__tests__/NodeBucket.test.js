/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeBucket } from '../../Elements/NodeBucket';

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

const mockProps = {
  ...sociogramOptionsDefault,
  node: {},
  updateNode: () => {},
  layout: 'foo',
  sort: {},
};

describe('<NodeBucket />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeBucket {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
