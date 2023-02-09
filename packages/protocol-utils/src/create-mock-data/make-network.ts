import { entityPrimaryKeyProperty, NcNetwork, Protocol, NcNode, NcEdge, NcEgo } from '@codaco/shared-consts';
import { get } from 'lodash';
import { makeNode, makeEgo, makeEdge } from './make-entities.js';

// Assumes protocol is valid
export const makeNetwork = (protocol: Protocol): NcNetwork => {
  const codebookNodeTypes = Object.keys(protocol.codebook.node ?? {});
  const codebookEdgeTypes = Object.keys(protocol.codebook.edge ?? {});

  // Generate nodes
  const nodes: NcNode[] = [];
  const networkMaxNodes = 20;
  const networkMinNodes = 2;

  for (const nodeType of codebookNodeTypes) {
    const numberOfNodesOfThisType = Math.round(
      Math.random() * ((networkMaxNodes - networkMinNodes) + networkMinNodes),
    );

    nodes.push(...[...Array.from({ length: numberOfNodesOfThisType })].map(() => makeNode(
      nodeType,
      get(protocol, ['codebook', 'node', nodeType, 'variables']),
    )));
  }

  const ego: NcEgo = makeEgo(get(protocol, ['codebook', 'ego', 'variables']));

  const edges: NcEdge[] = [];
  const networkMaxEdges = 20;
  const networkMinEdges = 1;
  const pickNodeUid = () => nodes[
    Math.floor(Math.random() * nodes.length)
  ][entityPrimaryKeyProperty];

  for (const edgeType of codebookEdgeTypes) {
    const edgesOfThisType = Math.round(
      Math.random() * ((networkMaxEdges - networkMinEdges) + networkMinEdges),
    );

    edges.push(...[...Array.from({ length: edgesOfThisType })].map(() => makeEdge(
      edgeType,
      pickNodeUid(),
      pickNodeUid(),
      get(protocol, ['codebook', 'edge', edgeType, 'variables']),
    )));
  }

  return {
    nodes,
    edges,
    ego,
  };
};

export default makeNetwork;
