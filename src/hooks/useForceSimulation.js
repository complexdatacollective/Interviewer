import {
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { get } from 'lodash';
import ForceSimulationWorker from './forceSimulation.worker';
import useViewport from './useViewport';

const VIEWPORT_SPACE_PX = 500;

const emptyNetwork = { nodes: [], links: [] };

const useForceSimulation = (listener = () => {}) => {
  const {
    viewport,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
    autoZoom,
  } = useViewport(VIEWPORT_SPACE_PX);
  const worker = useRef(null);
  const simNetwork = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const recalculate = useCallback(() => {
    state.current.nodes = simNetwork.current.nodes.map(calculateRelativeCoords);
  }, []);

  useEffect(() => viewport.zoom.onChange(() => recalculate()), [recalculate]);

  const initialize = useCallback((network = {}, options = {}) => {
    if (worker.current) { worker.current.terminate(); }

    worker.current = new ForceSimulationWorker();

    const { nodes, links } = { ...emptyNetwork, ...network };

    state.current = {
      links,
      nodes,
    };

    worker.current.onmessage = (event) => {
      switch (event.data.type) {
        case 'tick': {
          setIsRunning(true);
          simNetwork.current.nodes = event.data.nodes;
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          state.current.nodes = protocolNodes;
          listener({ type: 'tick', data: protocolNodes });
          break;
        }
        case 'end': {
          simNetwork.current.nodes = event.data.nodes;
          autoZoom(simNetwork.current.nodes);
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          state.current.nodes = protocolNodes;
          listener({ type: 'end', data: protocolNodes });
          setIsRunning(false);
          break;
        }
        default:
      }
    };

    simNetwork.current = {
      nodes: nodes.map(calculateLayoutCoords),
      links,
    };

    worker.current.postMessage({
      type: 'initialize',
      network: {
        nodes: simNetwork.current.nodes,
        links,
      },
      options,
    });

    setIsRunning(false);
  }, [setIsRunning]);

  const updateOptions = useCallback((options) => {
    if (!worker.current) { return; }

    worker.current.postMessage({
      type: 'update_options',
      options,
    });
  }, [initialize]);

  const start = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'start' });
  }, []);

  const reheat = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'reheat' });
  }, []);

  const stop = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'stop' });
    // worker.current = null;
  }, []);

  // TODO: separate update nodes and update links?
  const updateNetwork = useCallback((network) => {
    if (!worker.current) { return; }

    state.current = {
      ...state.current,
      ...network,
    };

    const newSimNetwork = {
      ...simNetwork.current,
      ...network,
      ...(network.nodes && { nodes: network.nodes.map(calculateLayoutCoords) }),
    };

    const shouldRestart = (
      (!!network.nodes && get(network, 'nodes', []).length !== get(simNetwork, 'current.nodes', []).length)
      || (!!network.links && get(network, 'links', []).length !== get(simNetwork, 'current.links', []).length)
    );

    simNetwork.current.nodes = newSimNetwork.nodes;
    simNetwork.current.links = newSimNetwork.links;

    worker.current.postMessage({
      type: 'update_network',
      network: newSimNetwork,
      restart: shouldRestart,
    });
  }, []);

  const updateNode = useCallback((node, index) => {
    if (!worker.current) { return; }

    worker.current.postMessage({
      type: 'update_node',
      node,
      index,
    });
  }, []);

  const moveNode = useCallback(({ dy, dx }, nodeIndex) => {
    const position = simNetwork.current.nodes[nodeIndex];

    const zoom = viewport.zoom.get();
    const nodeAttributes = {
      fx: position.x + ((dx * viewport.layoutSpace) / zoom),
      fy: position.y + ((dy * viewport.layoutSpace) / zoom),
    };

    updateNode(nodeAttributes, nodeIndex);
  }, [updateNode]);

  const releaseNode = useCallback((nodeIndex) => {
    updateNode({ fx: null, fy: null }, nodeIndex);
  }, [updateNode]);

  return {
    viewport: {
      moveViewport: (...args) => {
        moveViewport(...args);
        recalculate();
      },
      zoomViewport: (...args) => {
        zoomViewport(...args);
        recalculate();
      },
    },
    state,
    isRunning,
    initialize,
    updateOptions,
    start,
    stop,
    reheat,
    moveNode,
    releaseNode,
    updateNetwork,
  };
};

export default useForceSimulation;
