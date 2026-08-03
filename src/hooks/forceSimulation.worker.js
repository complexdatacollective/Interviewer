import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';

const DEFAULT_OPTIONS = {
  decay: 0.1,
  charge: -30,
  linkDistance: 30,
  center: 0.1,
};

let simulation;
let links;
let options = { ...DEFAULT_OPTIONS };

const cloneLinks = (ls) => ls.map((link) => ({ ...link }));

const updateOptions = (newOptions) => {
  Object.keys(newOptions).forEach((option) => {
    const value = newOptions[option];
    switch (option) {
      case 'decay':
        simulation.velocityDecay(value);
        break;
      case 'charge':
        simulation.force('charge', forceManyBody().strength(value));
        break;
      case 'center':
        simulation.force('x', forceX().strength(value));
        simulation.force('y', forceY().strength(value));
        break;
      case 'linkDistance':
        simulation.force('links', forceLink(cloneLinks(links)).distance(value));
        break;
      default:
    }
  });

  options = { ...options, ...newOptions }; // Update saved options

  simulation.alpha(0.3).restart();
};

onmessage = ({ data }) => {
  switch (data.type) {
    case 'initialize': {
      const { network } = data;

      links = network.links;

      const initialOptions = {
        ...DEFAULT_OPTIONS,
        ...data.options,
      };

      simulation = forceSimulation(network.nodes);

      updateOptions(initialOptions);

      // do not auto run
      simulation.alpha(0).stop();

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
    case 'update_options': {
      updateOptions(data.options);
      break;
    }
    case 'stop': {
      if (!simulation) {
        return;
      }
      simulation.stop();
      postMessage({
        type: 'end',
        nodes: simulation.nodes(),
      });
      break;
    }
    case 'start': {
      if (!simulation) {
        return;
      }
      simulation.alpha(1).restart();
      break;
    }
    case 'reheat': {
      if (!simulation) {
        return;
      }
      simulation.alpha(0.3).restart();
      break;
    }
    case 'update_network': {
      if (!simulation) {
        return;
      }

      const { network } = data;

      links = network.links;

      simulation.nodes(network.nodes);

      simulation.force(
        'links',
        forceLink(cloneLinks(links)).distance(options.linkDistance),
      );

      if (data.restart) {
        // TODO: don't run this on "first run"?
        simulation.alpha(0.3).restart();
      }
      break;
    }
    case 'update_node': {
      if (!simulation) {
        return;
      }

      const nodes = simulation.nodes().map((node, index) => {
        if (index !== data.index) {
          return node;
        }

        const newNode = {
          ...node,
          ...data.node,
        };

        return newNode;
      });

      simulation.nodes(nodes);

      simulation.force(
        'links',
        forceLink(cloneLinks(links)).distance(options.linkDistance),
      );

      simulation.alpha(0.3).restart();
      break;
    }
    default:
  }
};
