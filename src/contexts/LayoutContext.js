import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { get } from 'lodash';
import useForceSimulation from '../hooks/useForceSimulation';

const LayoutContext = React.createContext('layout');

const getLinks = ({ nodes, edges }) => {
  const nodeIdMap = nodes.reduce(
    (memo, { _uid }, index) => ({
      ...memo,
      [_uid]: index,
    }),
    {},
  );

  return edges.map(
    ({ from, to }) => ({ source: nodeIdMap[from], target: nodeIdMap[to] }),
  );
};

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
    reheat,
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
  const [links, setLinks] = useState([]);

  const getPosition = useRef(() => undefined);

  // TODO: this seems like a misguided approach, mixing "reactive"
  // and "constant" values. Any other ideas?
  useEffect(() => {
    getPosition.current = (index) => {
      if (!simulationEnabled) {
        return get(nodes, [index, 'attributes', layout]);
      }

      return get(forceSimulation.current.nodes, [index]);
    };
  }, [nodes, simulationEnabled]);

  const toggleSimulation = useCallback(() => {
    if (!simulationEnabled) {
      setSimulationEnabled(true);
      reheat();
      return;
    }

    setSimulationEnabled(false);
    stop();
  }, [simulationEnabled, setSimulationEnabled]);

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
    );

    const simulationLinks = getLinks({ nodes, edges });

    initialize({ nodes: simulationNodes, links: simulationLinks });
  }, []);

  useEffect(() => {
    if (!simulationEnabled) { return; }

    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
    );

    console.debug('update sim nodes');

    updateNetwork({ nodes: simulationNodes });
  }, [simulationEnabled, nodes, layout]);

  useEffect(() => {
    const nextLinks = getLinks({ nodes, edges });

    setLinks(nextLinks);
  }, [nodes, edges]);

  useEffect(() => {
    if (!simulationEnabled) { return; }

    console.debug('update sim links');

    updateNetwork({ links });
  }, [simulationEnabled, links]);

  const value = {
    network: {
      nodes,
      edges,
      layout,
      links,
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
      reheat,
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
