/**
 * @function
 * @name nodeLabelWorker
 * @description Generate a display label for a node.
 *
 * You may create any label based on input data; see examples below.
 * The variable registry is not directly accessible here; any properties should
 * be in sync with the registry defined in protocol.json.
 *
 * Do not change the name of this function.
 *
 * @param  {Object} data
 * @param  {Object} data.node All props for the node requiring a label
 * @param  {Object} data.network The current state of the network in this session
 * @param  {Array} data.network.nodes
 * @param  {Array} data.network.edges
 *
 * @return {string|Promise} a label for the input node, or
 *                          a promise that resolves to the label
 */
function nodeLabelWorker({ node, network }) {
  // Examples:
  //
  // 1. Given name, surname initial
  // const label = `${node.name} ${(node.last_name && `${node.last_name[0]}.`) || ''}`;
  //
  // 2. Counter based on data set or subset (here, the network nodes)
  // const index = network.nodes.findIndex(n => n.uid === node.uid);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;
  //
  // 3. Counter, based on network as well. Access to `externalData` TBD.
  // const networkNodeIds = {};
  // network.nodes.forEach((n) => { networkNodeIds[n.uid] = 1; });
  // const externalNodes = externalData.previousInterview.nodes.filter(n => !networkNodeIds[n.uid]);
  // const nodes = [...network.nodes, ...externalNodes].sort((a, b) => a.uid.localeCompare(b.uid));
  // const index = nodes.findIndex(n => n.uid === node.uid);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;
  //
  // 4. Add emoji suffix based on a node property
  // const label = `${node.name} ${node.close_friend ? '😇' : '😡'}`;
  // console.log('worker req', label);
  // setTimeout(() => postMessage({ node, label }), 1000 * Math.random());

  // 5. Add emoji based on an edge or node property
  let label = node.name;
  if (network.edges.some(e => e.from === node.id || e.to === node.id)) {
    label += '😎';
  } else if (node.close_friend) {
    label += '😇';
  }

  // To perform async work, return a promise instead.
  // Use this with care; the most recent response to the client will be used.
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve(label);
  //   }, 100);
  // });

  return label;
}
