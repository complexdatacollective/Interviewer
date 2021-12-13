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

const SIMULATION_OPTIONS = {
  decay: 0.1,
  charge: -30,
  linkDistance: 30,
  center: 0.1,
};

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
  allowAutomaticLayout: false,
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
  allowAutomaticLayout,
}) => {
  const {
    state: forceSimulation,
    isRunning,
    start,
    reheat,
    stop,
    initialize,
    updateOptions,
    moveNode,
    releaseNode,
    updateNetwork,
    viewport: {
      moveViewport,
      zoomViewport,
    },
  } = useForceSimulation();

  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [links, setLinks] = useState([]);

  const getPosition = useRef(() => undefined);

  // TODO: this seems like a misguided approach, mixing "reactive"
  // and "constant" values. Any other ideas?
  useEffect(() => {
    getPosition.current = (index) => {
      if (allowAutomaticLayout && simulationEnabled) {
        return get(forceSimulation.current.nodes, [index]);
      }

      return get(nodes, [index, 'attributes', layout]);
    };
  }, [nodes, simulationEnabled, allowAutomaticLayout]);

  const dispatch = useDispatch();

  const updateNetworkInStore = useCallback(() => {
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
  }, [dispatch, nodes, layout]);

  const previousIsRunning = useRef(false);

  useEffect(() => {
    const didStopRunning = !isRunning && previousIsRunning.current;
    previousIsRunning.current = isRunning;
    // if (simulationEnabled && didStopRunning) {
    if (didStopRunning) {
      updateNetworkInStore();
    }
  }, [isRunning, updateNetworkInStore]);

  const toggleSimulation = useCallback(() => {
    if (!simulationEnabled) {
      setSimulationEnabled(true);
      reheat();
      return;
    }

    stop();
    // Run setSimulationEnabled in next tick in order to
    // allow updateNetworkInStore to run before getPosition
    // changes to redux state.
    setTimeout(() => { setSimulationEnabled(false); }, 0);
  }, [simulationEnabled, setSimulationEnabled, updateNetworkInStore]);

  useEffect(() => {
    const nextLinks = getLinks({ nodes, edges });

    setLinks(nextLinks);
  }, [edges, nodes]);

  useEffect(() => {
    if (!allowAutomaticLayout) { return; }

    // We can start with an empty network since the other effects
    // will provide the nodes/links
    const network = {};
    initialize(network, SIMULATION_OPTIONS);
    start();
  }, [allowAutomaticLayout]);

  useEffect(() => {
    if (!allowAutomaticLayout || !simulationEnabled) { return; }

    const simulationNodes = nodes.map(
      ({ attributes }) => attributes[layout],
    );

    updateNetwork({ nodes: simulationNodes });
  }, [allowAutomaticLayout, simulationEnabled, nodes, layout]);

  useEffect(() => {
    if (!allowAutomaticLayout || !simulationEnabled) { return; }

    updateNetwork({ links });
  }, [allowAutomaticLayout, simulationEnabled, links]);

  const simulation = allowAutomaticLayout ? {
    simulation: forceSimulation,
    isRunning,
    initialize,
    updateOptions,
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
    allowAutomaticLayout,
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
