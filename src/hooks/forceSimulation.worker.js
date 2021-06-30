import {
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceLink,
} from 'd3-force';

onmessage = function (event) {
  const {
    data: {
      nodes,
      links,
    },
  } = event;

  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody())
    .force('link', forceLink(links).distance(20).strength(1))
    .force('x', forceX())
    .force('y', forceY())
    .stop();

  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    postMessage({
      type: 'tick',
      progress: i / n,
      nodes,
      links,
    });
    simulation.tick();
  }

  postMessage({
    type: 'end',
    nodes,
    links,
  });
};
