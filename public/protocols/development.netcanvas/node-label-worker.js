/**
 * Map an array of nodes to an array of labels (one for each node)
 * // TODO: just a single node? Can we support counter use cases with that?
 * @param  {[Object]} options.data: { nodes, network, variableRegistry }
 * @return {[string]} a label for each input node
 */
function createNodeLabels({ data: { nodes, network, variableRegistry } }) {
  console.log('[WORKER] Message received from main script', nodes, network, variableRegistry);

  // Here we'll give our nodes labels
  //
  // Examples:
  //
  // 1. Given name, surname initial
  // const labels = nodes.map(node => `${node.firstName} ${node.last_name && node.last_name[0]}.`);
  //
  // 2. Add incrementing counter
  // const labels = nodes.map((node, i) => `${node.name} ${i + 1}`);
  //
  // 3. Add counter to duplicate nicknames
  // const dupe = {}, labels = nodes.map(({ nickname: name }) => {
  //   if (dupe[name] === undefined) { dupe[name] = 0; }
  //   return dupe[name]++ ? `${name} ${dupe[name]}` : name;
  // });
  //
  // 4. Add emoji suffix based on node properties
  const labels = nodes.map(node => `${node.name} ${node.close_friend ? '😇' : '😡'}`);
  postMessage(labels);
}

// Assign handler to this worker (global)
onmessage = createNodeLabels;
