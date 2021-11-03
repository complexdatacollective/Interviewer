import {
  useRef,
  useCallback,
  useState,
} from 'react';
import ForceSimulationWorker from './forceSimulation.worker';

const useForceSimulation = (listener = () => {}) => {
  const worker = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(({ nodes = [], links = [] }) => {
    console.log('intialize worker');
    worker.current = new ForceSimulationWorker();

    state.current = {
      links,
      nodes,
    };

    worker.current.onmessage = (event) => {
      switch (event.data.type) {
        case 'tick':
          state.current.nodes = event.data.nodes;
          listener({ type: 'tick', data: event.data.nodes });
          break;
        case 'end':
          setIsRunning(false);
          break;
        default:
      }
    };

    worker.current.postMessage({
      type: 'initialize',
      network: {
        nodes,
        links,
      },
    });

    setIsRunning(true);
  });

  const stop = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'stop' });
    worker.current = null;
    setIsRunning(false);
  });

  const update = useCallback((network) => {
    if (!worker.current) { return; }

    state.current = {
      ...state.current,
      ...network,
    };

    worker.current.postMessage({
      type: 'update',
      network: state.current,
    });
  });

  const updateNode = useCallback((node, index) => {
    if (!worker.current) { return; }

    worker.current.postMessage({
      type: 'update_node',
      node,
      index,
    });
  });

  return [state, isRunning, start, stop, updateNode, update];
};

export default useForceSimulation;
