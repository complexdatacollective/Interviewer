import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceLink,
} from 'd3-force';

let simulation;

console.log('new force simulation worker!');

onmessage = function ({ data }) {
  switch (data.type) {
    case 'initialize': {
      const {
        network: {
          nodes,
          links,
        },
      } = data;
      console.debug('worker:initialize');
      simulation = forceSimulation(nodes)
        .force('charge', forceManyBody())
        .force('link', forceLink(links).distance(10).strength(1))
        .force('x', forceX())
        .force('y', forceY());

      simulation.on('tick', () => {
        console.debug('worker:tick');
        postMessage({
          type: 'tick',
          nodes: simulation.nodes(),
        });
      });

      simulation.on('end', () => {
        console.debug('worker:end');
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
    case 'update': {
      if (!simulation) { return; }
      const {
        network: {
          nodes,
          links,
        },
      } = data;

      simulation
        .nodes(nodes)
        .alpha(1)
        .force('link', forceLink(links).distance(10).strength(1));
      break;
    }
    default:
  }
};
