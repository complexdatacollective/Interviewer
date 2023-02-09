import { VariableDefinition, NcEdge, NcEntity, NcNode } from '@codaco/shared-consts';
export declare const makeEntity: (variables?: Record<string, VariableDefinition>, promptAttributes?: Record<string, VariableDefinition>) => NcEntity;
export declare const makeNode: (typeID: string, variables?: {}, promptAttributes?: {}) => NcNode;
export declare const makeEdge: (typeID: string, from: string, to: string, variables?: Record<string, VariableDefinition>, promptAttributes?: Record<string, VariableDefinition>) => NcEdge;
export declare const makeEgo: (variables?: Record<string, VariableDefinition>, promptAttributes?: Record<string, VariableDefinition>) => NcEntity;
//# sourceMappingURL=make-entities.d.ts.map