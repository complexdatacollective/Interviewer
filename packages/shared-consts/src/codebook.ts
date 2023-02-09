import { Color } from "./colors.js";
import { VariableDefinition } from "./variables.js";

// Docs: https://github.com/complexdatacollective/Network-Canvas/wiki/protocol.json#variable-registry
export enum EntityTypes {
  edge = 'edge',
  node = 'node',
}

export type EntityTypeDefinition = {
  name?: string,
  color?: Color,
  iconVariant?: string,
  variables: Record<string, VariableDefinition>;
};

export type NodeTypeDefinition = EntityTypeDefinition & {
  name: string;
  color: Color | string;
  iconVariant?: string;
};

export type EdgeTypeDefinition = NodeTypeDefinition;

export type Codebook = {
  node?: Record<string, NodeTypeDefinition>;
  edge?: Record<string, EdgeTypeDefinition>;
  ego?: EntityTypeDefinition;
};