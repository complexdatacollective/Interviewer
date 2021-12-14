/* eslint-disable no-console, func-names */
import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceLink,
} from 'd3-force';

let simulation;
let links;

console.log('new force simulation worker!');

const cloneLinks = (ls) => ls.map((link) => ({ ...link }));

const updateOptions = function (options) {
  Object.keys(options).forEach((option) => {
    const value = options[option];
    switch (option) {
      case 'decay':
        simulation.velocityDecay(value);
        break;
      case 'center':
        simulation.force('x').strength(value);
        simulation.force('y').strength(value);
        // simulation.force('center').strength(value);
        break;
      case 'linkDistance':
        simulation.force('links', forceLink(cloneLinks(links)).distance(value));
        break;
      default:
    }
  });

  simulation
    .alpha(0.3)
    .restart();
};

onmessage = function ({ data }) {
  switch (data.type) {
    case 'initialize': {
      const {
        network,
        options,
      } = data;

      links = network.links;

      console.debug('worker:initialize');

      simulation = forceSimulation(network.nodes)
        // .alphaTarget(0.3) // stay hot
        .velocityDecay(0.1) // low friction
        .force('charge', forceManyBody())
        .force('links', forceLink(cloneLinks(links)))
        // .force('collide', forceCollide().radius(50).iterations(2))
        .force('x', forceX()) // 0 as center
        .force('y', forceY()); // 0 as center

      updateOptions(options);

      // do not auto run
      simulation
        .alpha(0)
        .stop();

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
    case 'update_options': {
      const {
        options,
      } = data;

      updateOptions(options);
      break;
    }
    case 'stop': {
      if (!simulation) { return; }
      console.debug('worker:stop');
      simulation.stop();
      postMessage({
        type: 'end',
        nodes: simulation.nodes(),
      });
      break;
    }
    case 'start': {
      if (!simulation) { return; }
      console.debug('worker:start');
      simulation
        .alpha(1)
        .restart();
      break;
    }
    case 'reheat': {
      if (!simulation) { return; }
      console.debug('worker:start');
      simulation
        .alpha(0.3)
        .restart();
      break;
    }
    case 'update_network': {
      if (!simulation) { return; }

      console.log('update network', { data });

      const {
        network,
      } = data;

      links = network.links;

      simulation
        .nodes(network.nodes);

      simulation
        .force('links', forceLink(cloneLinks(links)));

      if (data.restart) {
      // TODO: don't run this on "first run"?
        simulation
          .alpha(0.3)
          .restart();
      }
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

        return newNode;
      });

      simulation
        .nodes(nodes);

      simulation
        .force('links', forceLink(cloneLinks(links)));

      simulation
        .alpha(0.3)
        .restart();
      break;
    }
    default:
  }
};
