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
    case 'init': {
      simulation = forceSimulation(nodes)
        .force('charge', forceManyBody())
        .force('link', forceLink(links).distance(20).strength(1))
        .force('x', forceX())
        .force('y', forceY())
        .stop();

      simulation.on('end', () => {
        postMessage({
          type: 'end',
          nodes: simulation.nodes(),
        });
      });
      break;
    }
    case 'tick': {
      simulation.tick();
      postMessage({
        type: 'tick',
        nodes: simulation.nodes(),
      });
      break;
    }
    default:
  }
};
