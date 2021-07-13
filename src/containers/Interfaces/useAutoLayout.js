import { useRef, useCallback } from 'react';
import { get } from 'lodash';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import useForceSimulation from '../../hooks/useForceSimulation';

const LAYOUT = 'ee090c9b-2b70-4648-a6db-328d4ef4dbfe';

const asXY = (layout = LAYOUT) => (node) => ({
  key: node[entityPrimaryKeyProperty],
  x: node[entityAttributesProperty][layout].x * 500,
  y: node[entityAttributesProperty][layout].y * 500,
});

const getIndexes = (nodes) => nodes
  .reduce((memo, node, index) => ({ ...memo, [node[entityPrimaryKeyProperty]]: index }), {});

const asLinks = (indexes) => (edge) => ({
  key: edge.key,
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

  const translatedPositions = positions.map((position) => ({
    x: (position.x - scale.minX) / scale.dX,
    y: (position.y - scale.minY) / scale.dY,
  }));

  return [
    translatedPositions,
    scale,
  ];
};

const useScaledPositions = () => {
  const positions = useRef([]);
  const scale = useRef({});

  const update = useCallback((nodes) => {
    const [
      translatedPositions,
      translationScale,
    ] = translatePositions(
      nodes,
    );

    positions.current = translatedPositions;
    scale.current = translationScale;
  });

  return [positions, scale, update];
};

const useAutoLayout = (layoutOptions = {}, simulationOptions = {}) => {
  const nodes = useRef([]);
  const edges = useRef([]);
  const indexes = useRef({});
  const links = useRef([]);
  const [positions, scale, updatePositions] = useScaledPositions();

  const updateHandler = ({ type, data }) => {
    switch (type) {
      case 'tick': {
        updatePositions(data);

        nodes.current = nodes.current.map((node) => {
          const originalPosition = get(node, [entityAttributesProperty, layoutOptions.layout]);
          const key = get(indexes.current, [node[entityPrimaryKeyProperty]]);
          const position = get(positions.current, [key], originalPosition);

          return {
            ...node,
            [entityAttributesProperty]: {
              ...node[entityAttributesProperty],
              [layoutOptions.layout]: position,
            },
          };
        });

        edges.current = edges.current.map((edge) => {
          const fromKey = get(indexes.current, edge.ids.from);
          const toKey = get(indexes.current, edge.ids.to);
          const from = get(positions.current, [fromKey], edge.from);
          const to = get(positions.current, [toKey], edge.to);

          return {
            ...edge,
            from,
            to,
          };
        });

        break;
      }
      default:
    }
  };

  const [
    simulationState,
    isRunning,
    startSimulation,
    stopSimulation,
    updateSimulation,
  ] = useForceSimulation(updateHandler);

  const start = useCallback((network) => {
    nodes.current = network.nodes;
    edges.current = network.edges;
    indexes.current = getIndexes(nodes.current);
    links.current = edges.current.map(asLinks(indexes.current));

    startSimulation({
      nodes: nodes.current.map(asXY()),
      links: links.current,
    });
  });

  const stop = stopSimulation;

  const update = useCallback((network) => {
    nodes.current = network.nodes;
    edges.current = network.edges;
    indexes.current = getIndexes(nodes);
    links.current = edges.map(asLinks(indexes));

    updateSimulation({
      nodes: nodes.current.map(asXY()),
      links: links.current,
    });
  });

  return [
    nodes,
    edges,
    scale,
    isRunning,
    start,
    stop,
    update,
  ];
};

export default useAutoLayout;
