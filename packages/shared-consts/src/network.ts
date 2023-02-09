export const entityPrimaryKeyProperty: '_uid' = '_uid';
export const entityAttributesProperty: 'attributes' = 'attributes';
export const edgeSourceProperty: 'from' = 'from';
export const edgeTargetProperty: 'to' = 'to';

export type NcEntity = {
  readonly [entityPrimaryKeyProperty]: string;
  [entityAttributesProperty]: Record<string, any>;
};

export type NcNode = NcEntity & {
  type: string;
  stageId?: string;
  promptIDs?: string[];
};

export type NcEdge = NcNode & {
  from: string;
  to: string;
};

export type NcEgo = NcEntity;


export type NcNetwork = {
  nodes: NcNode[];
  edges: NcEdge[];
  ego: NcEgo;
};
