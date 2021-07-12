import {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { noop } from 'lodash';
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

  const transformedNodes = nodes.map((node, index) => {
    if (!scaledPositions[index]) { return node; }

    return {
      ...node,
      [entityAttributesProperty]: {
        ...node[entityAttributesProperty],
        [layout]: scaledPositions[index],
      },
    };
  });

  const transformedEdges = edges.map((edge, index) => {
    if (!links[index]) { return edge; }

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

const useAutoLayout = (options) => {
  const state = useRef({
    positions: [],
    factors: {},
  });

  const [
    simulationState,
    isSimulationRunning,
    startSimulation,
    // stopSimulation,
  ] = useForceSimulation(({ data: { nodes } }) => {
    const [
      translatedPositions,
      translationFactors,
    ] = translateLayout(
      nodes,
    );
    state.current.positions.current = translatedPositions;
    state.current.factors.current = translationFactors;
  });

  const start = ({ nodes, edges }) => {
    const indexes = getIndexes(nodes);
    startSimulation({
      nodes: nodes.map(asXY()),
      links: edges.map(asLinks(indexes)),
    });
  };

  update.current = () => {
    if (simulationState.current) {
      const [
        translatedPositions,
        translationFactors,
      ] = translateLayout(
        simulationState.current.nodes,
      );

      setPositionedNodes(transformedNodes);
      setPositionedEdges(transformedEdges);
    }

    if (isSimulationRunning && enabled) {
      // console.log(isSimulationRunning, enabled);
      window.requestAnimationFrame(() => update.current());
    }
  };

  // useEffect(() => {
  //   const end = () => {
  //     console.log('end');
  //     window.cancelAnimationFrame(animation.current);
  //   };

  //   console.log('isSimulationRunning');

  //   if (isSimulationRunning) {
  //     update.current();
  //   } else {
  //     end();
  //   }

  //   return end;
  // }, [isSimulationRunning]);

  // if (!enabled) {
  //   return [nodes, edges, noop];
  // }

  return [positions, translationFactor, start, stop, update];
};

export default useAutoLayout;
