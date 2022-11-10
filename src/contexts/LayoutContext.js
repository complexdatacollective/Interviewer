import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  noop, clamp,
} from 'lodash';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import useForceSimulation from '../hooks/useForceSimulation';
import { get } from '../utils/lodash-replacements';
import { getTwoModeLayoutVariable } from '../components/RealtimeCanvas/utils';

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
  twoMode,
  allowAutomaticLayout,
}) => {
  const dispatch = useDispatch();

  const {
    state: forceSimulation,
    screen,
    isRunning,
    start,
    reheat,
    stop,
    initialize,
    updateOptions,
    moveNode,
    releaseNode,
    updateNetwork,
  } = useForceSimulation();

  const [simulationEnabled, setSimulationEnabled] = useState(true);
  const [links, setLinks] = useState([]);

  const previousIsRunning = useRef(false);
  const getPosition = useRef(() => undefined);

  // TODO: this seems like a misguided approach, mixing "reactive"
  // and "constant" values. Any other ideas?
  useEffect(() => {
    getPosition.current = (index) => {
      if (allowAutomaticLayout && simulationEnabled) {
        return get(forceSimulation.current.nodes, [index]);
      }

      const nodeType = get(nodes, [index, 'type']);
      const layoutVariable = getTwoModeLayoutVariable(twoMode, nodeType, layout);
      return get(nodes, [index, 'attributes', layoutVariable]);
    };
  }, [nodes, simulationEnabled, allowAutomaticLayout, layout, twoMode]);

  const updateNetworkInStore = useCallback(() => {
    if (!forceSimulation.current) { return; }

    nodes.forEach((node, index) => {
      const position = get(forceSimulation.current.nodes, [index]);
      if (!position) { return; }
      const { x, y } = position;

      const layoutVariable = twoMode ? layout[node.type] : layout;

      dispatch(
        sessionsActions.updateNode(
          node[entityPrimaryKeyProperty],
          undefined,
          { [layoutVariable]: { x: clamp(x, 0, 1), y: clamp(y, 0, 1) } },
        ),
      );
    });
  }, [dispatch, nodes, layout]);

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
      ({ attributes, type }) => {
        const layoutVariable = twoMode ? layout[type] : layout;
        return get(attributes, layoutVariable);
      },
    );

    updateNetwork({ nodes: simulationNodes });
  }, [allowAutomaticLayout, simulationEnabled, nodes, layout, twoMode]);

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
    screen,
    allowAutomaticLayout,
    twoMode,
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
