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
  simulation: {
    simulation: {},
    isRunning: false,
    initialize: noop,
    start: noop,
    reheat: noop,
    stop: noop,
    moveNode: noop,
    releaseNode: noop,
    getPosition: noop,
    simulationEnabled: false,
    toggleSimulation: noop,
  },
});

const getLinks = ({ nodes, edges }) => {
  if (nodes.length === 0 || edges.length === 0) { return []; }

  const nodeIdMap = nodes.reduce(
    (memo, { _uid }, index) => ({
      ...memo,
      [_uid]: index,
    }),
    {},
  );

  const links = edges.reduce(
    (acc, { from, to }) => {
      const source = nodeIdMap[from];
      const target = nodeIdMap[to];
      if (!source || !target) { return acc; }
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

    // console.debug('update sim nodes');

    updateNetwork({ nodes: simulationNodes });
  }, [simulationEnabled, nodes, layout]);

  useEffect(() => {
    const nextLinks = getLinks({ nodes, edges });

    setLinks(nextLinks);
  }, [edges, nodes]);

  useEffect(() => {
    if (!simulationEnabled) { return; }

    // console.debug('update sim links');

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
