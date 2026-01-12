import {
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import get from 'lodash/get';
import ForceSimulationWorker from './forceSimulation.worker?worker';
import screenManager from '../components/RealtimeCanvas/ScreenManager';
import useViewport from './useViewport';

const VIEWPORT_SPACE_PX = 500;

const emptyNetwork = { nodes: [], links: [] };

const useForceSimulation = (listener = () => { }) => {
  const screen = useRef(screenManager());
  const {
    calculateLayoutCoords,
    calculateRelativeCoords,
    autoZoom,
  } = useViewport(VIEWPORT_SPACE_PX);
  const worker = useRef(null);
  const simNetwork = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => () => {
    if (!worker.current) { return; }
    worker.current.terminate();
    worker.current = null;
  }, []);

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
          autoZoom(simNetwork.current.nodes, screen.current.get());
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          state.current.nodes = protocolNodes;
          listener({ type: 'tick', data: protocolNodes });
          break;
        }
        case 'end': {
          simNetwork.current.nodes = event.data.nodes;
          autoZoom(simNetwork.current.nodes, screen.current.get());
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

    const nodes = network.nodes || state.current.nodes;
    const simNodes = (network.nodes && network.nodes.map(calculateLayoutCoords))
      || simNetwork.current.nodes;

    const links = nodes.length > 0
      ? (network.links || state.current.links)
      : [];

    state.current = {
      nodes,
      links,
    };

    const newSimNetwork = {
      nodes: simNodes,
      links,
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

  const moveNode = useCallback(({ x, y }, nodeIndex) => {
    const layoutCoords = calculateLayoutCoords({ x, y });

    const nodeAttributes = {
      fx: layoutCoords.x,
      fy: layoutCoords.y,
    };

    updateNode(nodeAttributes, nodeIndex);
  }, [updateNode]);

  const releaseNode = useCallback((nodeIndex) => {
    updateNode({ fx: null, fy: null }, nodeIndex);
  }, [updateNode]);

  return {
    state,
    screen,
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
