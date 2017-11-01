/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayout } from '../NodeLayout';

const layout = 'foo';

const mockProps = {
  nodes: [
    { bar: 'buzz', uid: 123, [layout]: { x: 0, y: 0 } },
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
  allowSelect: false,
  allowPositioning: false,
  selectMode: '',
  nodeBinSortOrder: {},
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
      nodes: [{ bar: 'buzz', uid: 123 }],
    });

    component.setProps({
      ...mockProps,
      nodes: [{ bar: 'buzz', uid: 123 }, { bar: 'bing', uid: 456 }],
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
      nodes: [{ bar: 'buzz', uid: 123 }],
    });

    component.setProps({
      ...mockProps,
      width: 789,
    });

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });

  it('should forceUpdate() when onDropped callback is called', () => {
    const componentDidUpdate = jest.fn();
    NodeLayout.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayout {...mockProps} />,
      { lifecycleExperimental: true },
    );

    component.find('Connect(LayoutNode)').at(0).prop('onDropped')();

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });
});
