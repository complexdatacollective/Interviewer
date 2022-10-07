import React, {
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  get, noop, clamp,
} from 'lodash';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import screenManager from '../components/RealtimeCanvas/ScreenManager';
import useViewport from '../hooks/useViewport';
import useForceDirectedWorker from '../hooks/useForceDirectedWorker';

const VIEWPORT_SPACE_PX = 500;

/**
 * @typedef {Object} LayoutContextValue
 * @property {Object} network
 * @property {Object[]} network.nodes
 * @property {Object[]} network.edges
 *
 * Format edges as links, compatible with d3-force
 */
export const formatEdgesAsLinks = ({ nodes, edges }) => {
  if (nodes.length === 0 || edges.length === 0) { return []; }

  const nodeIdMap = nodes.reduce(
    (memo, node, index) => {
      const uid = node[entityPrimaryKeyProperty];
      return {
        ...memo,
        [uid]: index,
      };
    },
    {},
  );

  const links = edges.reduce(
    (acc, { from, to }) => {
      const source = nodeIdMap[from];
      const target = nodeIdMap[to];
      if (source === undefined || target === undefined) { return acc; }
      return [...acc, { source, target }];
    },
    [],
  );

  return links;
};

const LayoutContext = React.createContext({
  nodes: [],
  edges: [],
  getLayoutNodePosition: noop,
  forceDirected: false,
  simulation: undefined,
  screen: undefined,
});

export const LayoutProvider = ({
  children,
  nodes,
  edges,
  twoMode, // Does this stage have multiple node types
  forceDirected, // Determine if we enable force directed mode
  dontStoreLayout = false, // Should layout changes be stored back on the nodeX
  layoutAttributes, // Where layout should be stored
  interfaceRef, // Ref to the interface element to generate screen sizing
}) => {
  const dispatch = useDispatch();
  const screen = useRef(screenManager());
  const layoutNodes = useRef(null);
  const layoutEdges = useRef(null);

  const layoutAttributeForType = useCallback((type) => {
    if (!layoutAttributes) { throw new Error('Layout attributes not defined'); }
    if (twoMode) {
      return layoutAttributes[type];
    }

    return layoutAttributes;
  }, [layoutAttributes, twoMode]);

  // Convert incoming nodes and edges to layout nodes and edges
  useEffect(() => {
    layoutNodes.current = nodes.map((node) => {
      // Nodes that have not yet been placed will have a null value for the layout attribute
      const nodeLayoutAttributeValue = get(
        node,
        [entityAttributesProperty, layoutAttributeForType(node.type)],
        null,
      );

      // If the layout is null, flag the node as unpositioned and set a temporary position in the
      // node bucket
      if (nodeLayoutAttributeValue === null) {
        console.warn('Node has no layout attribute', node);
        return {
          ...node,
          unpositioned: true,
          x: 0.5,
          y: 0.5,
        };
      }

      const { x, y } = nodeLayoutAttributeValue;
      return {
        [entityPrimaryKeyProperty]: node[entityPrimaryKeyProperty],
        unpositioned: false,
        x,
        y,
      };
    });

    layoutEdges.current = formatEdgesAsLinks({ nodes, edges });
  }, [nodes, edges]);

  const {
    calculateLayoutCoords,
    calculateRelativeCoords,
    autoZoom,
  } = useViewport(VIEWPORT_SPACE_PX);

  const simulation = useForceDirectedWorker({
    screen: screen.current.get(),
    // onEnd: storeLayout,
  });

  const getLayoutNodePosition = useCallback((index) => get(layoutNodes.current, [index]),
    [layoutNodes]);

  /**
   * Commit the current node positions to the node's layout variable
   */
  const storeLayout = useCallback(() => {
    if (dontStoreLayout) { return; }

    nodes.forEach((node, index) => {
      const position = getLayoutNodePosition(index);

      if (!position) { return; }
      const { x, y } = position;

      const nodeLayoutAttribute = twoMode ? layoutAttributes[node.type] : layoutAttributes;

      dispatch(
        sessionsActions.updateNode(
          node[entityPrimaryKeyProperty],
          undefined,
          { [nodeLayoutAttribute]: { x: clamp(x, 0, 1), y: clamp(y, 0, 1) } },
        ),
      );
    });
  }, [nodes, layoutAttributes, twoMode, getLayoutNodePosition, dontStoreLayout]);

  useEffect(() => {
    if (forceDirected) {
      const simulationNodes = nodes.map(
        ({ attributes, type }) => {
          const layoutAttribute = twoMode ? layoutAttributes[type] : layoutAttributes;
          return get(attributes, layoutAttribute);
        },
      );
      simulation.updateNetwork({ nodes: simulationNodes });
    }
  }, [forceDirected, nodes, layoutAttributes, twoMode]);

  useEffect(() => {
    if (forceDirected) {
      const edgesAsLinks = formatEdgesAsLinks({ nodes, edges });
      simulation.updateNetwork({ links: edgesAsLinks });
    }
  }, [forceDirected, edges]);

  const moveNode = useCallback((position, index) => {
    if (forceDirected) {
      // simulation.moveNode(position, index);
      return;
    }

    layoutNodes.current[index].x = position.x;
    layoutNodes.current[index].y = position.y;
  });

  const handleDrag = useCallback((uuid, index, delta) => {
    const relativeDelta = calculateRelativeCoords(delta, screen.current.get());
    moveNode(relativeDelta, index);
  }, [screen, moveNode]);

  const handleDragEnd = useCallback((uuid, index) => {
    storeLayout();
  }, [storeLayout]);

  const value = {
    screen,
    twoMode,
    nodes,
    edges,
    getLayoutNodePosition,
    handleDrag,
    handleDragEnd,
    interfaceRef,
  };

  // Manage screen
  useEffect(() => {
    screen.current.initialize(interfaceRef.current);
    return () => {
      screen.current.destroy();
    };
  }, [interfaceRef]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
