import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { get, noop, clamp } from 'lodash';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import useForceSimulation from '../hooks/useForceSimulation';

const LayoutContext = React.createContext({
  network: {
    nodes: [],
    edges: [],
    layout: undefined,
    links: [],
  },
  viewport: {
    moveViewport: noop,
    zoomViewport: noop,
  },
  getPosition: noop,
  allowSimulation: false,
  simulation: undefined,
});

export const getLinks = ({ nodes, edges }) => {
  if (nodes.length === 0 || edges.length === 0) { return []; }

  const nodeIdMap = nodes.reduce(
    (memo, node, index) => {
      const uid = node[entityPrimaryKeyProperty];
      return {
        ...memo,
        [uid]: index,
      };
    },
    {},
  );

  const links = edges.reduce(
    (acc, { from, to }) => {
      const source = nodeIdMap[from];
      const target = nodeIdMap[to];
      if (source === undefined || target === undefined) { return acc; }
      return [...acc, { source, target }];
    },
    [],
  );

  return links;
};

export const LayoutProvider = ({
  children,
  nodes,
  edges,
  layout,
  allowSimulation,
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
      if (allowSimulation && simulationEnabled) {
        return get(forceSimulation.current.nodes, [index]);
      }

      return get(nodes, [index, 'attributes', layout]);
    };
  }, [nodes, simulationEnabled, allowSimulation]);

  const dispatch = useDispatch();

  const updateNetworkInStore = useCallback(() => {
    if (!simulationEnabled) { return; }

    if (!forceSimulation.current) { return; }

    nodes.forEach((node, index) => {
      const position = get(forceSimulation.current.nodes, [index]);
      if (!position) { return; }
      const { x, y } = position;
      dispatch(
        sessionsActions.updateNode(
          node[entityPrimaryKeyProperty],
          undefined,
          { [layout]: { x: clamp(x, 0, 1), y: clamp(y, 0, 1) } },
        ),
      );
    });
  }, [dispatch, nodes, layout, simulationEnabled]);

  const previousIsRunning = useRef(false);

  useEffect(() => {
    if (!isRunning && simulationEnabled && previousIsRunning.current) {
      updateNetworkInStore();
    }
    previousIsRunning.current = isRunning;
  }, [isRunning, simulationEnabled, updateNetworkInStore]);

  const toggleSimulation = useCallback(() => {
    if (!simulationEnabled) {
      setSimulationEnabled(true);
      reheat();
      return;
    }

    updateNetworkInStore(); // Prevent old redraw
    setSimulationEnabled(false);
    stop();
  }, [simulationEnabled, setSimulationEnabled, updateNetworkInStore]);

  useEffect(() => {
    const nextLinks = getLinks({ nodes, edges });

    setLinks(nextLinks);
  }, [edges, nodes]);

  useEffect(() => {
    if (!allowSimulation) { return; }

    // const simulationNodes = nodes.map(
    //   ({ attributes }) => attributes[layout],
    // );

    // const simulationLinks = getLinks({ nodes, edges });

    // initialize({ nodes: simulationNodes, links: simulationLinks });
    initialize({ nodes: [], links: [] });
  }, [allowSimulation]);

  useEffect(() => {
    if (!allowSimulation || !simulationEnabled) { return; }

    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
    );

    updateNetwork({ nodes: simulationNodes });
  }, [allowSimulation, simulationEnabled, nodes, layout]);

  useEffect(() => {
    if (!allowSimulation || !simulationEnabled) { return; }

    updateNetwork({ links });
  }, [allowSimulation, simulationEnabled, links]);

  const simulation = allowSimulation ? {
    simulation: forceSimulation,
    isRunning,
    initialize,
    start,
    reheat,
    stop,
    moveNode,
    releaseNode,
    simulationEnabled,
    toggleSimulation,
  } : undefined;

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
    allowSimulation,
    getPosition,
    simulation,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
