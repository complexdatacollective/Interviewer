import {
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import ForceSimulationWorker from './forceSimulation.worker';
import useViewport from './useViewport';

const useForceSimulation = (listener = () => {}) => {
  const {
    viewport,
    moveViewport,
    zoomViewport,
    calculateLayoutCoords,
    calculateRelativeCoords,
  } = useViewport();
  const worker = useRef(null);
  const simNodes = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const recalculate = useCallback(() => {
    state.current.nodes = simNodes.current.map(calculateRelativeCoords);
  }, []);

  const initialize = useCallback(({ nodes = [], links = [] }) => {
    worker.current = new ForceSimulationWorker();

    state.current = {
      links,
      nodes,
    };

    worker.current.onmessage = (event) => {
      switch (event.data.type) {
        case 'tick': {
          setIsRunning(true);
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          simNodes.current = event.data.nodes;
          state.current.nodes = protocolNodes;
          listener({ type: 'tick', data: protocolNodes });
          break;
        }
        case 'end': {
          const protocolNodes = event.data.nodes.map(calculateRelativeCoords);
          simNodes.current = event.data.nodes;
          state.current.nodes = protocolNodes;
          console.debug('end', simNodes.current, protocolNodes, viewport);
          listener({ type: 'end', data: protocolNodes });
          setIsRunning(false);
          break;
        }
        default:
      }
    };

    simNodes.current = nodes.map(calculateLayoutCoords);

    console.debug(nodes.map(calculateLayoutCoords), nodes, simNodes.current);

    worker.current.postMessage({
      type: 'initialize',
      network: {
        nodes: simNodes.current,
        links,
      },
    });

    setIsRunning(false);
  }, [setIsRunning]);

  const start = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'start' });
  }, [setIsRunning]);

  const stop = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'stop' });
    // worker.current = null;
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
    const position = simNodes.current[nodeIndex]; // ?? simNodes?

    console.log({ position, dy, dx });

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
    start,
    stop,
    moveNode,
    releaseNode,
    updateNetwork,
  };
};

export default useForceSimulation;
