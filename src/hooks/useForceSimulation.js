import { useRef, useCallback, useEffect } from 'react';
// import { throttle } from '
import ForceSimulationWorker from './forceSimulation.worker';

// example listener:
// function (event) {
//   switch (event.data.type) {
//     case "tick": return ticked(event.data);
//     case "end": return ended(event.data);
//   }
// };

let count = 0;

const useForceSimulation = (listener) => {
  const worker = useRef(new ForceSimulationWorker());
  const rAF = useRef(null);

  const tick = useCallback(() => {
    count += 1;
    // console.log('tick');
    worker.current.postMessage({
      type: 'tick',
    });

    if (count > 100) { return; }
    rAF.current = requestAnimationFrame(tick);
  });

  const init = useCallback(({ nodes, edges }) => {
    worker.current.postMessage({
      type: 'init',
      nodes,
      edges,
    });

    count = 0;

    tick();
  });

  useEffect(() => {
    worker.current.onmessage = (event) => {
      if (event.data.type === 'end') {
        cancelAnimationFrame(rAF);
      }

      listener(event);
    };
  }, []);

  return [init];
};

export default useForceSimulation;
