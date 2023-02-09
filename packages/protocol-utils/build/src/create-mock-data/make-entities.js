import { edgeSourceProperty, edgeTargetProperty, entityPrimaryKeyProperty, entityAttributesProperty } from '@codaco/shared-consts';
import { has } from 'lodash';
import { v4 as uuid } from 'uuid';
import make from './make-mock-value.js';
export const makeEntity = (variables = {}, promptAttributes = {}) => {
    const mockAttributes = {};
    for (const [uid, variable] of Object.entries(variables)) {
        if (has(promptAttributes, uid)) {
            break;
        }
        const mockVariable = make(variable);
        mockAttributes[uid] = mockVariable;
    }
    return {
        [entityPrimaryKeyProperty]: uuid(),
        [entityAttributesProperty]: {
            ...mockAttributes,
        },
    };
};
export const makeNode = (typeID, variables = {}, promptAttributes = {}) => {
    const entity = makeEntity(variables, promptAttributes);
    const modelData = {
        promptIDs: ['mock'],
        stageId: 'mock',
        type: typeID,
    };
    return {
        ...entity,
        ...modelData,
    };
};
export const makeEdge = (typeID, from, to, variables = {}, promptAttributes = {}) => {
    const entity = makeEntity(variables, promptAttributes);
    return {
        ...entity,
        type: typeID,
        [edgeSourceProperty]: from,
        [edgeTargetProperty]: to,
    };
};
export const makeEgo = makeEntity;
