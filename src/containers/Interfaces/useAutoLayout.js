import { useState, useEffect } from 'react';
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
  const indexes = getIndexes(nodes);
  const _nodes = nodes.map(asXY());
  const _links = edges.map(asLinks(indexes));

  const [nodeCoords, setNodeCoords] = useState(
    nodes.map(asXY()),
  );

  const handler = (event) => {
    switch (event.data.type) {
      case 'tick':
        setNodeCoords(event.data.nodes);
        break;
      case 'end':
        setNodeCoords(event.data.nodes);
        break;
      default:
    }
  };

  const [initLayoutEngine] = useForceSimulation(handler);

  useEffect(() => {
    setTimeout(() => {
      initLayoutEngine({
        nodes: _nodes,
        links: _links,
      });
    }, 5000);
  }, []);

  const start = () => {};
  const stop = () => {};
  const running = false;

  const mmd = nodeCoords.reduce((memo, coords, index) => {
    const minX = memo.minX === null || coords.x < memo.minX ? coords.x : memo.minX;
    const minY = memo.minY === null || coords.y < memo.minY ? coords.y : memo.minY;
    const maxX = memo.maxX === null || coords.x > memo.maxX ? coords.x : memo.maxX;
    const maxY = memo.maxY === null || coords.y > memo.maxY ? coords.y : memo.maxY;

    if (index === nodeCoords.length - 1) {
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

  const __nodes = nodes.map((node, index) => ({
    ...node,
    attributes: {
      ...node.attributes,
      [LAYOUT]: {
        x: 0.1 + (nodeCoords[index].x - mmd.minX) / mmd.dX * 0.8,
        y: 0.1 + (nodeCoords[index].y - mmd.minY) / mmd.dY * 0.8,
      },
    },
  }));

  const __edges = edges.map((edge, index) => ({
    ...edge,
    from: __nodes[_links[index].source].attributes[LAYOUT],
    to: __nodes[_links[index].target].attributes[LAYOUT],
  }));

  console.log(__edges);

  return [__nodes, __edges];
};

export default useAutoLayout;
