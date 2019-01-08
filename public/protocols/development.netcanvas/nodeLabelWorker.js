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
 * @param  {string} data.node.networkCanvasId Unique ID for the node. Note that if your data
 *                                            happens to already contain a property named
 *                                            "networkCanvasId", your prop will take precedence,
 *                                            and identifying edge connections will fail.
 * @param  {string} data.node.networkCanvasType The node type as specified in network canvas. As
 *                                            above, if the happens to already contain a property \
 *                                            named "networkCanvasType", your prop will take
 *                                            precedence.
 * @param  {Object} data.network The current state of the network in this session
 * @param  {Array} data.network.nodes Each node has a unique `networkCanvasId` prop
 * @param  {Array} data.network.edges Edges contain `to` and `from` props which
 *                                    correspond to nodes' `networkCanvasId` values
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
  // const index = network.nodes.findIndex(n => n.networkCanvasId === node.networkCanvasId);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;
  //
  // 3. Counter, based on network as well. Access to `externalData` TBD.
  // const networkNodeIds = {};
  // network.nodes.forEach((n) => { networkNodeIds[n.networkCanvasId] = 1; });
  // const externalNodes = externalData.previousInterview.nodes
  //    .filter(n => !networkNodeIds[n.networkCanvasId]);
  // const nodes = [...network.nodes, ...externalNodes]
  //    .sort((a, b) => a.networkCanvasId.localeCompare(b.networkCanvasId));
  // const index = nodes.findIndex(n => n.networkCanvasId === node.networkCanvasId);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;
  //
  // 4. Add emoji suffix based on a node property
  // const label = `${node.name} ${node.close_friend ? '😇' : '😡'}`;
  // console.log('worker req', label);
  // setTimeout(() => postMessage({ node, label }), 1000 * Math.random());

  // 5. Add emoji based on an edge or node property
  // let label = node.name;
  // if (network.edges.some(e => e.from === node.networkCanvasId || e.to === node.networkCanvasId)) {
  //   label += '😎';
  // } else if (node.close_friend) {
  //   label += '😇';
  // }

  // To perform async work, return a promise instead.
  // Use this with care; the most recent response to the client will be used.
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve(label);
  //   }, 100);
  // });


  // For our example worker we will return a different label dependant on the node type.
  let label = node.nickname || node.name;

  switch (node.networkCanvasType) {
    case 'person':
      if (network.edges.some(
        edge => edge.from === node.networkCanvasId || edge.to === node.networkCanvasId
      )) {
        label += '😎';
      } else if (node.close_friend) {
        label += '😇';
      }
      break;
    case 'venue':
      label = `🏥 ${node.name.split(' ')
        .map(word => `${word.charAt(0).toUpperCase()}. `)
        .join(' ')}`;
      break;
    default:
      break;
  }

  return label;
}
