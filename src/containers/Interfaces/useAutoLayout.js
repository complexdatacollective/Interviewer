import { useRef, useCallback } from 'react';
import { get } from 'lodash';
import { entityPrimaryKeyProperty, entityAttributesProperty } from '../../ducks/modules/network';
import useForceSimulation from '../../hooks/useForceSimulation';

const asXY = (layout, scale) => {
  const dX = scale.dX || 500;
  const dY = scale.dY || 500;
  const minX = scale.minX || 0;
  const minY = scale.minY || 0;

  return (node) => {
    console.log({ entityAttributesProperty, layout });

    const {
      x,
      y,
    } = node[entityAttributesProperty][layout];

    return {
      key: node[entityPrimaryKeyProperty],
      x: x * dX - minX,
      y: y * dY - minY,
    };
  };
};

const filterWithLayout = (layout, nodes) => nodes
  .reduce(
    (acc, node) => {
      const {
        x,
        y,
      } = node[entityAttributesProperty][layout];

      if (x === null || y === null) { return acc; }

      return [
        ...acc,
        node,
      ];
    },
    [],
  );

const asXYs = (layout, scale, nodes) => nodes.map(asXY(layout, scale));

const getIndexes = (layout, nodes) => nodes
  .reduce(
    (acc, node, index) => ({
      ...acc,
      [node[entityPrimaryKeyProperty]]: index,
    }),
    {},
  );

const asLink = (indexes, edge) => {
  if (!indexes[edge.ids.from] || !indexes[edge.ids.to]) {
    return null;
  }

  return {
    key: edge.key,
    source: indexes[edge.ids.from],
    target: indexes[edge.ids.to],
  };
};

const asLinks = (indexes, edges) => edges
  .reduce((acc, edge) => {
    const link = asLink(indexes, edge);
    if (!link) { return acc; }
    return [...acc, link];
  }, []);

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

  const {
    layout,
  } = layoutOptions;

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
    nodes.current = filterWithLayout(layout, network.nodes);
    edges.current = network.edges;
    indexes.current = getIndexes(layout, nodes.current);
    links.current = asLinks(indexes.current, edges.current);

    const simulationNodes = asXYs(layout, scale, nodes.current);

    console.log({ simulationNodes, nodes: nodes.current, links: links.current });

    startSimulation({
      nodes: simulationNodes,
      links: links.current,
    });
  }, [scale]);

  const stop = stopSimulation;

  const update = useCallback((network) => {
    nodes.current = filterWithLayout(layout, network.nodes);
    edges.current = network.edges;
    indexes.current = getIndexes(layout, nodes.current);
    links.current = asLinks(indexes.current, edges.current);

    const simulationNodes = asXYs(layout, scale, nodes.current);

    console.log({ simulationNodes, nodes: nodes.current, links });

    updateSimulation({
      nodes: simulationNodes,
      // nodes: nodes.current.map(asXY(layoutOptions.layout, scale)),
      links: links.current,
    });
  }, [scale]);

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
