import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
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
  // const state = useRef({ nodes: [], edges: [] });

  const handleSimulationMessage = ({ data }) => {
    // console.log('handle sim data', { data });
    // for (let index = 0; index < state.current.nodes.length; index += 1) {
    //   state.current.nodes[index].position = data[index];
    // }

    // for (let index = 0; index < state.current.edges.length; index += 1) {
    //   // state.current.edges[index].start = state.current.nodes[startIndex].position;
    //   // state.current.edges[index].end = state.current.nodes[endIndex].position;
    // }
  };

  const [
    forceSimulation,
    isRunning,
    start,
    stop,
    updateNode,
    update,
  ] = useForceSimulation(handleSimulationMessage);

  const [
    viewportState,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    calculateViewportRelativeCoords,
    calculateViewportScreenCoords,
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

  // const value = useMemo(() => ({
  //   forceSimulation: {
  //     simulation: forceSimulation,
  //     isRunning,
  //     start,
  //     stop,
  //     updateNodeByDelta,
  //     // TODO: updateNode() accounting for viewport?
  //   },
  //   viewport: {
  //     moveViewport,
  //     zoomViewport,
  //     calculateLayoutCoords,
  //     calculateRelativeCoords,
  //     calculateViewportRelativeCoords,
  //     calculateViewportScreenCoords,
  //     measureCanvas,
  //   },
  //   nodes,
  //   edges,
  //   layout,
  // }), [layout, nodes, edges]);

  const value = {
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
      calculateViewportRelativeCoords,
      calculateViewportScreenCoords,
      measureCanvas,
    },
    nodes,
    edges,
    layout,
  };

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes }) => calculateLayoutCoords(attributes[layout]),
    );

    const nodeIdMap = nodes.reduce(
      (memo, { _uid }, index) => ({
        ...memo,
        [_uid]: index,
      }),
      {},
    );

    const simulationLinks = edges.map(
      ({ from, to }) => ({ source: nodeIdMap[from], target: nodeIdMap[to] }),
    );

    start({ nodes: simulationNodes, links: simulationLinks });
  }, []);

  useEffect(() => {
    debugger;
    const simulationNodes = nodes.map(
      ({ attributes }) => calculateLayoutCoords(attributes[layout]),
    );

    update({ nodes: simulationNodes });
  }, [nodes, layout]);

  useEffect(() => {
    debugger;

    const nodeIdMap = nodes.reduce(
      (memo, { _uid }, index) => ({
        ...memo,
        [_uid]: index,
      }),
      {},
    );

    const simulationLinks = edges.map(
      ({ from, to }) => ({ source: nodeIdMap[from], target: nodeIdMap[to] }),
    );

    // debugger;

    update({ links: simulationLinks });
  }, [nodes, edges]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
