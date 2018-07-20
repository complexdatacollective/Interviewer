/**
 * Map an array of nodes to an array of labels (one for each node)
 * @param  {Object} options.data: { nodes, network, variableRegistry }
 * @return {string} a label for each input node
 */
function createNodeLabel({ data: { node, network, externalData } }) {
  //
  // Goal: define a label for the given node.
  // We can use information about the node itself, the network, or external data.
  // Examples:
  //
  // 1. Given name, surname initial
  // const label = `${node.name} ${(node.last_name && `${node.last_name[0]}.`) || ''}`;
  //
  // 2. Counter based on data set or subset (here, previousInterview)
  // const index = externalData.previousInterview.nodes.findIndex(n => n.uid === node.uid);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;

  // 3. Counter, based on network as well (assumes UIDs added)
  // const networkNodeIds = {};
  // network.nodes.forEach((n) => { networkNodeIds[n.uid] = 1; });
  // const externalNodes = externalData.previousInterview.nodes.filter(n => !networkNodeIds[n.uid]);
  // const nodes = [...network.nodes, ...externalNodes].sort((a, b) => a.uid.localeCompare(b.uid));
  // const index = nodes.findIndex(n => n.uid === node.uid);
  // const label = index > -1 ? `${node.name} ${index + 1}` : node.name;
  //
  // 4. Add emoji suffix based on a node property
  const label = `${node.name} ${node.close_friend ? '😇' : '😡'}`;

  postMessage(label);
}

// Assign handler to this worker (global)
onmessage = createNodeLabel;
