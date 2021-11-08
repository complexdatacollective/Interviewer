import {
  forceSimulation,
  forceX,
  forceY,
  forceCollide,
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

      console.log(links);

      console.debug('worker:initialize');
      simulation = forceSimulation(nodes)
        // .alphaTarget(0.3) // stay hot
        .velocityDecay(0.1) // low friction
        .force('charge', forceManyBody().strength(-60))
        // .force('collide', forceCollide().radius(50).iterations(3))
        .force('links', forceLink(links))
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
        .nodes(nodes);

      simulation
        .force('links')
        .links(links);

      simulation
        .alpha(0.3)
        .restart();
      break;
    }
    case 'update_node': {
      if (!simulation) { return; }

      const nodes = simulation.nodes().map((node, index) => {
        if (index !== data.index) { return node; }

        const newNode = {
          ...node,
          ...data.node,
        };

        // console.log('updatenode', JSON.stringify({ node, data, newNode }));

        return newNode;
      });

      simulation
        .nodes(nodes);

      simulation
        .alpha(0.3)
        .restart();
      break;
    }
    default:
  }
};