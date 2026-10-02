import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { entityPrimaryKeyProperty } from '@codaco/shared-consts';

import LayoutContext from '../../../contexts/LayoutContext';
import NodeLayout from '../NodeLayout';

vi.mock('../../../containers/Node', () => ({
  default: ({ [entityPrimaryKeyProperty]: uid }) => (
    <div data-testid="node">{uid}</div>
  ),
}));

const makeContext = (nodes) => ({
  network: { nodes, edges: [], layout: 'layout', links: [] },
  screen: {
    current: {
      initialize: () => {},
      destroy: () => {},
      calculateScreenCoords: ({ x, y }) => ({ x, y }),
    },
  },
  getPosition: { current: () => undefined },
  allowAutomaticLayout: false,
  twoMode: false,
});

const node = (uid) => ({
  [entityPrimaryKeyProperty]: uid,
  type: 'person',
  attributes: { layout: { x: 0.5, y: 0.5 } },
});

const renderedNodes = (container) =>
  [...container.querySelectorAll('[data-testid="node"]')].map(
    (el) => el.textContent,
  );

describe('NodeLayout', () => {
  const container = document.createElement('div');

  afterEach(() => {
    unmountComponentAtNode(container);
  });

  const renderWith = (nodes) =>
    act(() => {
      render(
        <LayoutContext.Provider value={makeContext(nodes)}>
          <NodeLayout onSelected={() => {}} />
        </LayoutContext.Provider>,
        container,
      );
    });

  it('renders the nodes it mounts with', () => {
    renderWith([node('a'), node('b')]);

    expect(renderedNodes(container)).toEqual(['a', 'b']);
  });

  // Placing a node on the sociogram adds it to the layout. Its portal element
  // is created after the render that first sees it, so without a follow-up
  // render the node stayed invisible until something else re-rendered.
  it('renders a node added after mount without another update', () => {
    renderWith([node('a')]);
    renderWith([node('a'), node('b')]);

    expect(renderedNodes(container)).toEqual(['a', 'b']);
  });
});
