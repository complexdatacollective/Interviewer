import {
  useRef,
  useCallback,
  useState,
} from 'react';
import ForceSimulationWorker from './forceSimulation.worker';
import useViewport from './useViewport';

const useForceSimulation = (listener = () => {}) => {
  const [
    viewport,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
  ] = useViewport();
  const worker = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const initialize = useCallback(({ nodes = [], links = [] }) => {
    worker.current = new ForceSimulationWorker();

    state.current = {
      links,
      nodes,
    };

    console.log(1, state.current);

    worker.current.onmessage = (event) => {
      switch (event.data.type) {
        case 'tick': {
          setIsRunning(true);
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          console.log(3, protocolNodes);
          state.current.nodes = protocolNodes;
          listener({ type: 'tick', data: protocolNodes });
          break;
        }
        case 'end':
          listener({ type: 'end', data: event.data.nodes.map(calculateRelativeCoords) });
          setIsRunning(false);
          break;
        default:
      }
    };

    const simNodes = nodes.map(calculateLayoutCoords);

    worker.current.postMessage({
      type: 'initialize',
      network: {
        nodes: simNodes,
        links,
      },
    });

    setIsRunning(false);
  }, [setIsRunning]);

  const start = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'start' });
    setIsRunning(true);
  }, [setIsRunning]);

  const stop = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'stop' });
    // worker.current = null;
    setIsRunning(false);
  }, [setIsRunning]);

  const updateNetwork = useCallback((network) => {
    if (!worker.current) { return; }

    state.current = {
      ...state.current,
      ...network,
    };

    const simNetwork = {
      ...state.current,
      ...network,
      ...(network.nodes && { nodes: network.nodes.map(calculateLayoutCoords) }),
    };

    console.log(2, state.current, simNetwork);

    worker.current.postMessage({
      type: 'update',
      network: simNetwork,
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
    const position = state.current.nodes[nodeIndex];

    // TODO: provide as decimal delta?
    const nodeAttributes = {
      fy: position.y + (dy / viewport.current.zoom),
      fx: position.x + (dx / viewport.current.zoom),
    };

    updateNode(nodeAttributes, nodeIndex);
  }, [updateNode]);

  const releaseNode = useCallback((nodeIndex) => {
    updateNode({ fx: null, fy: null }, nodeIndex);
  }, [updateNode]);

  return {
    viewport: {
      moveViewport,
      zoomViewport,
    },
    state,
    isRunning,
    initialize,
    start,
    stop,
    moveNode,
    releaseNode,
    updateNetwork,
  };
};

export default useForceSimulation;
