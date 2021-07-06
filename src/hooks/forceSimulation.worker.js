import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceLink,
} from 'd3-force';

let simulation;

onmessage = function (event) {
  const {
    data: {
      nodes,
      links,
    },
  } = event;

  switch (event.data.type) {
    case 'initialize': {
      simulation = forceSimulation(nodes)
        .force('charge', forceManyBody())
        .force('link', forceLink(links).distance(10).strength(1))
        .force('x', forceX())
        .force('y', forceY());

      simulation.on('tick', () => {
        postMessage({
          type: 'tick',
          nodes: simulation.nodes(),
        });
      });

      simulation.on('end', () => {
        postMessage({
          type: 'end',
          nodes: simulation.nodes(),
        });
      });
      break;
    }
    case 'stop': {
      if (!simulation) { return; }
      simulation.stop();
      break;
    }
    // case 'start': {
    //   console.log('start', { simulation });
    //   if (!simulation) { return; }
    //   simulation.restart();
    //   break;
    // }
    default:
  }
};
