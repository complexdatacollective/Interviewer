import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { get } from 'lodash';
import useForceSimulation from '../hooks/useForceSimulation';

const LayoutContext = React.createContext('layout');

export const LayoutProvider = ({
  children,
  nodes,
  edges,
  layout,
}) => {
  const {
    state: forceSimulation,
    isRunning,
    start,
    stop,
    initialize,
    moveNode,
    releaseNode,
    updateNetwork,
    viewport: {
      moveViewport,
      zoomViewport,
    },
  } = useForceSimulation();

  const [simulationEnabled, setSimulationEnabled] = useState(false);

  const getPosition = useRef(() => undefined);

  // TODO: this seems like a misguided approach, mixing "reactive"
  // and "constant" values. Any other ideas?
  useEffect(() => {
    getPosition.current = (index) => {
      if (!simulationEnabled) {
        // console.log({ node: get(nodes, [index, 'attributes']), layout: get(nodes, [index, 'attributes', layout]) });
        return get(nodes, [index, 'attributes', layout]);
      }

      return get(forceSimulation.current.nodes, [index]);
    };
  }, [nodes, simulationEnabled]);

  const toggleSimulation = useCallback(() => {
    setSimulationEnabled((enabled) => !enabled);
  }, [setSimulationEnabled]);

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
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

    initialize({ nodes: simulationNodes, links: simulationLinks });
  }, []);

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
    );

    console.debug('update sim nodes');

    updateNetwork({ nodes: simulationNodes });
  }, [nodes, layout]);

  useEffect(() => {
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

    console.debug('update sim links');

    updateNetwork({ links: simulationLinks });
  }, [nodes, edges]);

  const value = {
    network: {
      nodes,
      edges,
      layout,
    },
    viewport: {
      moveViewport,
      zoomViewport,
    },
    simulation: {
      simulation: forceSimulation,
      isRunning,
      initialize,
      start,
      stop,
      moveNode,
      releaseNode,
      getPosition,
      simulationEnabled,
      toggleSimulation,
    },
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
