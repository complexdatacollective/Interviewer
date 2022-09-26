import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  get, noop, clamp,
} from 'lodash';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import useForceSimulation from '../hooks/useForceSimulation';

const SIMULATION_OPTIONS = {
  decay: 0.1,
  charge: -30,
  linkDistance: 20,
  center: 0.1,
};

const LayoutContext = React.createContext({
  network: {
    nodes: [],
    edges: [],
    layout: undefined,
    links: [],
  },
  getPosition: noop,
  enableAutomaticLayout: false,
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
  twoMode, // Does this stage have multiple node types
  enableAutomaticLayout, // Should the layout be updated automatically
  allowPositioning, // Should the user be able to position nodes
  allowSelect, // Is node highlighting enabled
  dontUpdateLayout = false, // Should layout changes be stored back on the node
  layoutAttributes, // Where layout should be stored
}) => {
  const dispatch = useDispatch();

  const {
    state: forceSimulation,
    isRunning, // If the simulation is currently iterating. NOT the same as being enabled.
    screen,
    start, // Start the simulation
    reheat, // Reset the simulation
    stop, // Stop the simulation
    freezeNodes,
    unfreezeNodes,
    initialize, // Initialize the simulation
    updateOptions, // Update the simulation options
    moveNode, // Move a node to a position
    updateNode, // Update node directly
    updateNetwork, // Update the network
  } = useForceSimulation({});

  const [simulationEnabled, setSimulationEnabled] = useState(enableAutomaticLayout);
  const [links, setLinks] = useState([]);

  const previousIsRunning = useRef(false);
  const getPosition = useCallback((index) => get(forceSimulation.current.nodes, [index]),
    [forceSimulation]);

  const updateNetworkInStore = useCallback(() => {
    if (!forceSimulation.current) { return; }
    if (dontUpdateLayout) { return; }

    nodes.forEach((node, index) => {
      const position = get(forceSimulation.current.nodes, [index]);
      if (!position) { return; }
      const { x, y } = position;

      const nodeLayoutAttribute = twoMode ? layoutAttributes[node.type] : layoutAttributes;

      dispatch(
        sessionsActions.updateNode(
          node[entityPrimaryKeyProperty],
          undefined,
          { [nodeLayoutAttribute]: { x: clamp(x, 0, 1), y: clamp(y, 0, 1) } },
        ),
      );
    });
  }, [nodes, layoutAttributes]);

  useEffect(() => {
    const didStopRunning = !isRunning && previousIsRunning.current;
    previousIsRunning.current = isRunning;

    if (didStopRunning) {
      updateNetworkInStore();
    }
  }, [isRunning, updateNetworkInStore]);

  const toggleSimulation = useCallback(() => {
    if (!simulationEnabled) {
      setSimulationEnabled(true);
      unfreezeNodes();
      return;
    }

    freezeNodes();
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
    // We can start with an empty network since the other effects
    // will provide the nodes/links
    const network = {};
    initialize(network, SIMULATION_OPTIONS);

    if (enableAutomaticLayout) {
      start();
    } else {
      freezeNodes();
    }
  }, []);

  useEffect(() => {
    const simulationNodes = nodes.map(
      ({ attributes, type }) => {
        const layoutAttribute = twoMode ? layoutAttributes[type] : layoutAttributes;
        return get(attributes, layoutAttribute);
      },
    );

    updateNetwork({ nodes: simulationNodes });
  }, [simulationEnabled, nodes, layoutAttributes, twoMode]);

  useEffect(() => {
    updateNetwork({ links });
  }, [simulationEnabled, links]);

  const simulation = {
    simulation: forceSimulation,
    isRunning,
    initialize,
    updateOptions,
    start,
    reheat,
    stop,
    moveNode,
    updateNode,
    simulationEnabled,
    toggleSimulation,
  };

  const value = {
    network: {
      nodes,
      edges,
      links,
    },
    enableAutomaticLayout,
    allowPositioning,
    allowSelect,
    twoMode,
    getPosition,
    simulation,
    screen,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
