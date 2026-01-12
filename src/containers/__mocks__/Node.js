import { vi } from 'vitest';
import React from 'react';

const MockNode = (props) => <div className="mock-node" {...props} />;
MockNode.displayName = 'Connect(Node)';

export const Node = MockNode;
export default MockNode;
