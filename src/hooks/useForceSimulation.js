import { useRef, useCallback, useEffect } from 'react';
import ForceSimulationWorker from './forceSimulation.worker.js';

// example listener:
// function (event) {
//   switch (event.data.type) {
//     case "tick": return ticked(event.data);
//     case "end": return ended(event.data);
//   }
// };

const useForceSimulation = (listener) => {
  const worker = useRef(new ForceSimulationWorker());

  const init = useCallback(({ nodes, links }) => {
    worker.current.postMessage({
      nodes,
      links,
    });
  });

  useEffect(() => {
    worker.current.onmessage = (event) => {
      listener(event);
    };
  }, []);

  return [init];
};

export default useForceSimulation;
