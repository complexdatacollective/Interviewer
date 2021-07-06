import { useState, useEffect, useRef } from 'react';
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

const useAutoLayout = (layout, nodes, edges) => {
  const animation = useRef(null);
  const update = useRef(() => {});
  const indexes = getIndexes(nodes);
  const links = edges.map(asLinks(indexes));
  const [positionedNodes, setPositionedNodes] = useState(nodes.map(asXY()));
  const [positionedEdges, setPositionedEdges] = useState(links);

  const [
    layoutEngineState,
    isRunning,
    initLayoutEngine,
    startLayoutEngine,
  ] = useForceSimulation();

  const updatePositions = () => {
    const engineNodes = layoutEngineState.current.nodes;

    const mmd = engineNodes.reduce((memo, coords, index) => {
      const minX = memo.minX === null || coords.x < memo.minX ? coords.x : memo.minX;
      const minY = memo.minY === null || coords.y < memo.minY ? coords.y : memo.minY;
      const maxX = memo.maxX === null || coords.x > memo.maxX ? coords.x : memo.maxX;
      const maxY = memo.maxY === null || coords.y > memo.maxY ? coords.y : memo.maxY;

      if (index === engineNodes.length - 1) {
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

    const nodePositions = nodes.map((_, index) => ({
      x: 0.1 + (engineNodes[index].x - mmd.minX) / mmd.dX * 0.8,
      y: 0.1 + (engineNodes[index].y - mmd.minY) / mmd.dY * 0.8,
    }));

    const edgePositions = links.map(({ source, target }) => ({
      from: nodePositions[source],
      to: nodePositions[target],
    }));

    setPositionedNodes(nodePositions);
    setPositionedEdges(edgePositions);
  };

  update.current = () => {
    if (isRunning) {
      window.requestAnimationFrame(() => update.current());
    }

    if (!layoutEngineState.current) { return; }

    updatePositions();
  };

  useEffect(() => {
    initLayoutEngine({
      nodes: nodes.map(asXY()),
      links,
    });

    setTimeout(() => {
      startLayoutEngine();
    }, 2000);
  }, []);

  useEffect(() => {
    if (!animation.current) { update.current(); }

    return () => window.cancelAnimationFrame(animation.current);
  }, [isRunning]);

  return [positionedNodes, positionedEdges];
};

export default useAutoLayout;
