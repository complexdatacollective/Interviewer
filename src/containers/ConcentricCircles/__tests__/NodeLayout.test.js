/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayout } from '../NodeLayout';
import { NodePrimaryKeyProperty } from '../../../ducks/modules/network';

const layout = 'foo';

const mockProps = {
  nodes: [
    { bar: 'buzz', [NodePrimaryKeyProperty]: 123, [layout]: { x: 0, y: 0 } },
  ],
  updateNode: () => {},
  toggleEdge: () => {},
  toggleHighlight: () => {},
  width: 123,
  height: 456,
  layoutVariable: layout,
  createEdge: 'bar',
  displayEdges: [],
  canCreateEdge: false,
  canHighlight: false,
  highlightAttributes: {},
  allowHighlighting: false,
  allowPositioning: false,
  selectMode: '',
  sortOrderBy: [],
  concentricCircles: 0,
  skewedTowardCenter: false,
};

describe('<NodeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeLayout {...mockProps} />);

    expect(component).toMatchSnapshot();
  });

  it('shouldComponentUpdate() when prop `nodes` changes length only', () => {
    const componentDidUpdate = jest.fn();
    NodeLayout.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayout {...mockProps} />,
      { lifecycleExperimental: true },
    );

    component.setProps({
      ...mockProps,
      nodes: [{ bar: 'buzz', [NodePrimaryKeyProperty]: 123 }],
    });

    component.setProps({
      ...mockProps,
      nodes: [{ bar: 'buzz', [NodePrimaryKeyProperty]: 123 }, { bar: 'bing', [NodePrimaryKeyProperty]: 456 }],
    });

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });

  it('shouldComponentUpdate() when prop other than `nodes` changes', () => {
    const componentDidUpdate = jest.fn();
    NodeLayout.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayout {...mockProps} />,
      { lifecycleExperimental: true },
    );

    component.setProps({
      ...mockProps,
      nodes: [{ bar: 'buzz', [NodePrimaryKeyProperty]: 123 }],
    });

    component.setProps({
      ...mockProps,
      width: 789,
    });

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });
});
