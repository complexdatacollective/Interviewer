/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { shallow } from 'enzyme';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import NodeLayout from '../NodeLayout';

const layout = 'foo';

const mockProps = {
  nodes: [
    {
      [entityPrimaryKeyProperty]: 123,
      [entityAttributesProperty]: { isOn: true, [layout]: { x: 0, y: 0 } },
    },
    {
      [entityPrimaryKeyProperty]: 1,
      [entityAttributesProperty]: { isOn: false, [layout]: { x: 0, y: 0 } },
    },
  ],
  updateNode: () => { },
  toggleEdge: () => { },
  toggleHighlight: () => { },
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

  describe('isLinking', () => {
    it('detects connecting state', () => {
      const subject = shallow(<NodeLayout {...mockProps} connectFrom={1} />);
      const result = subject.find('LayoutNode').map((n) => {
        const node = n.prop('node');
        return [
          node[entityPrimaryKeyProperty],
          n.prop('linking'),
        ];
      });
      expect(result).toEqual([
        [123, false],
        [1, true],
      ]);
    });
  });

  describe.only('highlighting', () => {
    const subject = shallow(<NodeLayout {...mockProps} highlightAttribute="isOn" />);

    it('detects highlight state', () => {
      // expect(subject.instance().isHighlighted({ attributes: { isOn: true } })).toBe(true);
      // expect(subject.instance().isHighlighted({ attributes: {} })).toBe(false);

      const result = subject.find('LayoutNode').map((n) => {
        const node = n.prop('node');
        return [
          node[entityPrimaryKeyProperty],
          n.prop('selected'),
        ];
      });
      expect(result).toEqual([
        [123, true],
        [1, false],
      ]);
    });
  });
});
