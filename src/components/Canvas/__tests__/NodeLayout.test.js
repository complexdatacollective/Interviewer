/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeLayout } from '../NodeLayout';
import { nodePrimaryKeyProperty } from '../../../ducks/modules/network';

const layout = 'foo';

const mockProps = {
  nodes: [
    { bar: 'buzz', [nodePrimaryKeyProperty]: 123, [layout]: { x: 0, y: 0 } },
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
  sortOrder: [],
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
      nodes: [{ bar: 'buzz', [nodePrimaryKeyProperty]: 123 }],
    });

    component.setProps({
      ...mockProps,
      nodes: [{ bar: 'buzz', [nodePrimaryKeyProperty]: 123 }, { bar: 'bing', [nodePrimaryKeyProperty]: 456 }],
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
      nodes: [{ bar: 'buzz', [nodePrimaryKeyProperty]: 123 }],
    });

    component.setProps({
      ...mockProps,
      width: 789,
    });

    expect(componentDidUpdate.mock.calls.length).toEqual(1);
  });

  describe('isLinking', () => {
    it('detects connecting state', () => {
      const subject = shallow(<NodeLayout {...mockProps} connectFrom="1" />);
      expect(subject.instance().isLinking({ _uid: '1' })).toBe(true);
      expect(subject.instance().isLinking({ _uid: '2' })).toBe(false);
    });
  });

  describe('highlighting', () => {
    const subject = shallow(<NodeLayout highlightAttributes={[{ variable: 'isOn', color: 'neon' }]} />);

    it('detects highlight state', () => {
      expect(subject.instance().isHighlighted({ attributes: { isOn: true } })).toBe(true);
      expect(subject.instance().isHighlighted({ attributes: {} })).toBe(false);
    });

    it('gets the highlight color', () => {
      expect(subject.instance().getHighlightColor({ attributes: { isOn: true } })).toBe('neon');
      expect(subject.instance().getHighlightColor({ attributes: {} })).toBe('');
    });
  });
});
