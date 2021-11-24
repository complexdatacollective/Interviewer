/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { shallow, mount } from 'enzyme';
import { createStore } from 'redux';
import { noop } from 'lodash';
import { Provider } from 'react-redux';
import NodeLayout from '../NodeLayout';
import {
  entityPrimaryKeyProperty,
  entityAttributesProperty,
} from '../../../ducks/modules/network';
import LayoutContext from '../../../contexts/LayoutContext';

jest.mock('../../../hooks/forceSimulation.worker');
// jest.mock('../../../hooks/useForceSimulation');

jest.useFakeTimers();

const layout = 'foo';

const mockProps = {
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
  ref: () => {},
};

const ref = (value) => ({ current: value });

const mockContext = {
  network: {
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
    edges: [],
  },
  viewport: {},
  simulation: {
    simulation: ref({}),
    getPosition: ref(noop),
  },
};

const mockStore = createStore((s) => s, {});

const WithContext = ({
  children,
  store = mockStore,
  layoutContext = mockContext,
}) => (
  <Provider store={store}>
    <LayoutContext.Provider value={layoutContext}>
      {children}
    </LayoutContext.Provider>
  </Provider>
);

describe('<NodeLayout />', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.requestAnimationFrame = (f) => setTimeout(() => f(), 0);
  });

  it('renders ok', () => {
    const component = mount((
      <WithContext>
        <NodeLayout {...mockProps} />
      </WithContext>
    ));

    expect(component).toMatchSnapshot();
  });

  describe.only('isLinking', () => {
    it('detects connecting state', async () => {
      const subject = mount((
        <WithContext>
          <NodeLayout {...mockProps} connectFrom={1} />
        </WithContext>
      ));
      // await act(() => new Promise(setImmediate));
      // await act(() => new Promise(setImmediate));
      // await act(() => new Promise(setImmediate));
      // subject.update();
      // subject.render();
      jest.runOnlyPendingTimers();
      subject.update();
      subject.render();
      console.log(subject.html());
      const result = subject.find('LayoutNode').map((n) => {
        const node = n.prop('node');
        return [
          node[entityPrimaryKeyProperty],
          n.prop('linking'),
        ];
      });
      return expect(result).toEqual([
        [123, false],
        [1, true],
      ]);
    });
  });

  describe('highlighting', () => {
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
