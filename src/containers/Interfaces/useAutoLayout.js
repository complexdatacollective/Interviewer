import { useRef } from 'react';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import useForceSimulation from '../../hooks/useForceSimulation';

const LAYOUT = 'ee090c9b-2b70-4648-a6db-328d4ef4dbfe';

const asXY = (layout = LAYOUT) => (node) => ({
  x: node[entityAttributesProperty][layout].x,
  y: node[entityAttributesProperty][layout].y,
});

const getIndexes = (nodes) => nodes
  .reduce((memo, node, index) => ({ ...memo, [node[entityPrimaryKeyProperty]]: index }), {});

const asLinks = (indexes) => (edge) => ({
  id: edge.key,
  source: indexes[edge.ids.from],
  target: indexes[edge.ids.to],
});

export const translatePositions = (positions) => {
  const scale = positions.reduce((memo, coords, index) => {
    const minX = (memo.minX === null || coords.x < memo.minX) ? coords.x : memo.minX;
    const maxX = (memo.maxX === null || coords.x > memo.maxX) ? coords.x : memo.maxX;
    const minY = (memo.minY === null || coords.y < memo.minY) ? coords.y : memo.minY;
    const maxY = (memo.maxY === null || coords.y > memo.maxY) ? coords.y : memo.maxY;

    const next = {
      ...memo,
      minX,
      minY,
      maxX,
      maxY,
    };

    if (index === positions.length - 1) {
      const dX = maxX - minX;
      const dY = maxY - minY;

      return {
        ...next,
        dX,
        dY,
      };
    }

    return next;
  }, {
    minX: null,
    maxX: null,
    minY: null,
    maxY: null,
    dY: null,
    dX: null,
  });

  const translatedPositions = positions.reduce((acc, position) => ({
    ...acc,
    [position.id]: {
      x: 0.1 + (position.x - scale.minX) / scale.dX * 0.8,
      y: 0.1 + (position.y - scale.minY) / scale.dY * 0.8,
    },
  }), {});

  return [
    translatedPositions,
    scale,
  ];
};

const useAutoLayout = () => {
  const positions = useRef([]);
  const scale = useRef({});

  const onUpdate = ({ type, data: { nodes } }) => {
    switch (type) {
      case 'tick': {
        const [
          translatedPositions,
          translationScale,
        ] = translatePositions(
          nodes,
        );

        positions.current = translatedPositions;
        scale.current = translationScale;
        break;
      }
      default:
    }
  };

  const [
    simulationState,
    isSimulationRunning,
    startSimulation,
    stopSimulation,
    updateSimulation,
  ] = useForceSimulation(onUpdate);

  const start = ({ nodes, edges }) => {
    const indexes = getIndexes(nodes);

    startSimulation({
      nodes: nodes.map(asXY()),
      links: edges.map(asLinks(indexes)),
    });
  };

  return [
    positions,
    scale,
    isSimulationRunning,
    start,
    stopSimulation,
    updateSimulation,
  ];
};

export default useAutoLayout;
