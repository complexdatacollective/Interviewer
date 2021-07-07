import {
  useRef,
  useCallback,
  useState,
} from 'react';
import ForceSimulationWorker from './forceSimulation.worker';

const useForceSimulation = () => {
  const worker = useRef(null);
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(({ nodes, links }) => {
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
          break;
        case 'end':
          setIsRunning(false);
          break;
        default:
      }
    };

    worker.current.postMessage({
      type: 'initialize',
      nodes,
      links,
    });

    setIsRunning(true);
  });

  const stop = useCallback(() => {
    if (!worker.current) { return; }
    worker.current.postMessage({ type: 'stop' });
    worker.current = null;
    setIsRunning(false);
  });

  return [state, isRunning, start, stop];
};

export default useForceSimulation;
