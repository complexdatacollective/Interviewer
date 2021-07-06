import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import useForceSimulation from '../../hooks/useForceSimulation';

const LAYOUT = 'ee090c9b-2b70-4648-a6db-328d4ef4dbfe';

const asXY = (layout = LAYOUT) => (node) => ({
  x: node.attributes[layout].x,
  y: node.attributes[layout].y,
});

const getIndexes = (nodes) => nodes
  .reduce((memo, node, index) => ({ ...memo, [node._uid]: index }), {});

const asLinks = (indexes) => (edge) => ({
  id: edge.key,
  source: indexes[edge.ids.from],
  target: indexes[edge.ids.to],
});

const getScaledPositions = (nodePositions) => {
  const scale = nodePositions.reduce((memo, coords, index) => {
    const minX = memo.minX === null || coords.x < memo.minX ? coords.x : memo.minX;
    const minY = memo.minY === null || coords.y < memo.minY ? coords.y : memo.minY;
    const maxX = memo.maxX === null || coords.x > memo.maxX ? coords.x : memo.maxX;
    const maxY = memo.maxY === null || coords.y > memo.maxY ? coords.y : memo.maxY;

    if (index === nodePositions.length - 1) {
      const dX = maxX - minX;
      const dY = maxY - minY;

      return {
        dX,
        dY,
        minY,
        minX,
      };
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
    };
  }, {
    minX: null,
    maxX: null,
    minY: null,
    maxY: null,
  });

  return nodePositions.map((position) => ({
    x: 0.1 + (position.x - scale.minX) / scale.dX * 0.8,
    y: 0.1 + (position.y - scale.minY) / scale.dY * 0.8,
  }));
};

export const transformLayout = (layout, nodes, edges, nodePositions, links) => {
  const scaledPositions = getScaledPositions(nodePositions);

  const transformedNodes = nodes.map((node, index) => ({
    ...node,
    attributes: {
      ...node.attributes,
      [layout]: scaledPositions[index],
    },
  }));

  const transformedEdges = edges.map((edge, index) => {
    const { source, target } = links[index];

    return {
      ...edge,
      from: scaledPositions[source],
      to: scaledPositions[target],
    };
  });

  return [
    transformedNodes,
    transformedEdges,
  ];
};

const useAutoLayout = (layout, nodes, edges) => {
  const animation = useRef(null);
  const update = useRef(() => {});
  const indexes = useMemo(() => getIndexes(nodes), [nodes]);
  const [positionedNodes, setPositionedNodes] = useState();
  const [positionedEdges, setPositionedEdges] = useState();

  const [
    simulationState,
    isSimulationRunning,
    startSimulation,
  ] = useForceSimulation();

  const start = () => {
    startSimulation({
      nodes: nodes.map(asXY()),
      links: edges.map(asLinks(indexes)),
    });
  };

  update.current = () => {
    if (isSimulationRunning) {
      window.requestAnimationFrame(() => update.current());
    }

    if (!simulationState.current) { return; }

    const [
      transformedNodes,
      transformedEdges,
    ] = transformLayout(
      layout,
      nodes,
      edges,
      simulationState.current.nodes,
      simulationState.current.links,
    );

    setPositionedNodes(transformedNodes);
    setPositionedEdges(transformedEdges);
  };

  useEffect(() => {
    if (!animation.current) { update.current(); }

    return () => window.cancelAnimationFrame(animation.current);
  }, [isSimulationRunning]);

  return [positionedNodes, positionedEdges, start];
};

export default useAutoLayout;
