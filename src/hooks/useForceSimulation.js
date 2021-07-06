import { useRef, useCallback, useEffect, useState } from 'react';
import ForceSimulationWorker from './forceSimulation.worker';

// example listener:
// function (event) {
//   switch (event.data.type) {
//     case "tick": return ticked(event.data);
//     case "end": return ended(event.data);
//   }
// };

const useForceSimulation = (listener) => {
  const worker = useRef(new ForceSimulationWorker());
  const state = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const init = useCallback(({ nodes, links }) => {
    worker.current.postMessage({
      type: 'initialize',
      nodes,
      links,
    });
  });

  const start = useCallback(() => {
    worker.current.postMessage({ type: 'start' });
    setIsRunning(true);
  });

  const stop = useCallback(() => {
    worker.current.postMessage({ type: 'stop' });
    setIsRunning(false);
  });

  useEffect(() => {
    worker.current.onmessage = (event) => {
      // listener(event);
      switch (event.data.type) {
        case 'tick':
          state.current = event.data;
          break;
        case 'end':
          setIsRunning(false);
          break;
        default:
      }
    };
  }, []);

  return [state, isRunning, init, start, stop];
};

export default useForceSimulation;
