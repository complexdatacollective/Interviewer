/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayoutPure } from '../NodeLayout';

const layout = 'foo';

const mockProps = {
  nodes: [
    { bar: 'buzz', uid: 123, [layout]: { x: 0, y: 0 } },
  ],
  updateNode: () => {},
  toggleEdge: () => {},
  toggleNodeAttributes: () => {},
  width: 123,
  height: 456,
  attributes: {},
  edge: null,
  select: null,
  canPosition: false,
  canSelect: false,
  layout,
};

describe('<NodeLayout />', () => {
  it('renders ok', () => {
    const component = shallow(<NodeLayoutPure {...mockProps} />);

    expect(component).toMatchSnapshot();
  });

  it('shouldComponentUpdate() when prop `nodes` changes length only', () => {
    const componentDidUpdate = jest.fn();
    NodeLayoutPure.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayoutPure {...mockProps} />,
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
    NodeLayoutPure.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayoutPure {...mockProps} />,
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
    NodeLayoutPure.prototype.componentDidUpdate = componentDidUpdate;

    const component = shallow(
      <NodeLayoutPure {...mockProps} />,
      { lifecycleExperimental: true },
    );

    component.find('Connect(LayoutNode)').at(0).prop('onDropped')();

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });
});
