/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeBucket } from '../NodeBucket';

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
  node: { label: 'some label' },
  updateNode: () => {},
  layout: 'foo',
  sort: {},
  getLabel: node => node.label,
};

describe('<NodeBucket />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeBucket {...mockProps} />);

    expect(component).toMatchSnapshot();
  });
});
