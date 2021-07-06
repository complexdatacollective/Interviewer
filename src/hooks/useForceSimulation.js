import {
  useRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import ForceSimulationWorker from './forceSimulation.worker';

const useForceSimulation = () => {
  const worker = useRef(new ForceSimulationWorker());
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback(({ nodes, links }) => {
    worker.current.postMessage({
      type: 'initialize',
      nodes,
      links,
    });

    state.current = {
      links,
      nodes,
    };

    setIsRunning(true);
  });

  const stop = useCallback(() => {
    worker.current.postMessage({ type: 'stop' });
    setIsRunning(false);
  });

  useEffect(() => {
    worker.current.onmessage = (event) => {
      switch (event.data.type) {
        case 'tick':
          state.current.nodes = event.data.nodes;
          break;
        case 'end':
          console.log({ finish: state.current });
          setIsRunning(false);
          break;
        default:
      }
    };
  }, []);

  return [state, isRunning, start, stop];
};

export default useForceSimulation;
