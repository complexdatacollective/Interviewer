import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import useForceSimulation from '../hooks/useForceSimulation';
import useViewport from '../components/RealtimeCanvas/useViewport';

const DEFAULT_LAYOUT = 'd13ca72d-aefe-4f48-841d-09f020e0e988'; // TODO: remove

const LayoutContext = React.createContext('layout ');

export const LayoutProvider = ({
  children,
  nodes,
  edges,
  layout = DEFAULT_LAYOUT,
}) => {
  const state = useRef({ nodes: [], edges: [] });

  const handleSimulationMessage = ({ data }) => {
    for (let index = 0; index < state.current.nodes.length; index += 1) {
      state.current.nodes[index].position = data[index];
    }

    for (let index = 0; index < state.current.edges.length; index += 1) {
      // state.current.edges[index].start = state.current.nodes[startIndex].position;
      // state.current.edges[index].end = state.current.nodes[endIndex].position;
    }
  };

  const [
    forceSimulation,
    isRunning,
    start,
    stop,
    updateNode,
  ] = useForceSimulation(handleSimulationMessage);

  const [
    viewportState,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    calculateScreenCoords,
    measureCanvas,
  ] = useViewport();

  const updateNodeByDelta = useCallback((delta, id) => {
    const position = forceSimulation.current.nodes[id];

    const newPosition = {
      y: position.y + (delta.dy / viewportState.current.zoom),
      x: position.x + (delta.dx / viewportState.current.zoom),
    };

    updateNode(newPosition, id);
  }, [updateNode]);

  const value = useMemo(() => ({
    forceSimulation: {
      simulation: forceSimulation,
      isRunning,
      start,
      stop,
      updateNodeByDelta,
      // TODO: updateNode() accounting for viewport?
    },
    viewport: {
      moveViewport,
      zoomViewport,
      calculateLayoutCoords,
      calculateRelativeCoords,
      calculateScreenCoords,
      measureCanvas,
    },
    state,
    layout,
  }), [layout]);

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes }) => calculateLayoutCoords(attributes[layout]),
    );

    state.current.nodes = nodes.map((node) => ({ data: node }));
    state.current.edges = edges.map((edge) => ({ data: edge }));

    start({ nodes: simulationNodes });
  }, [nodes, edges, layout]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
