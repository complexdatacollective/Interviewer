import React from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';

const getCoords = (nodes, edge) => {
  const from = find(nodes, ['id', edge.from]);
  const to = find(nodes, ['id', edge.to]);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    from: from.closenessLayout,
    to: to.closenessLayout,
  };
};

const EdgeLayout = ({ nodes, edges }) => (
  <div className="edge-layout">
    <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      { edges.map((edge) => {
        const { from, to } = getCoords(nodes, edge);
        if (!from || !to) { return null; }
        return <line key={`${edge.from}_${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
      }) }
    </svg>
  </div>
);

EdgeLayout.propTypes = {
  edges: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
};

export default EdgeLayout;
