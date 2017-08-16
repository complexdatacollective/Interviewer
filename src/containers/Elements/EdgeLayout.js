import React from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';

const getCoords = (nodes, edge) => {
  console.log(edge);
  const from = find(nodes, ['id', edge.from]);
  const to = find(nodes, ['id', edge.to]);

  if (!from || !to) { return { error: true }; }

  return {
    from: from.closenessLayout,
    to: to.closenessLayout,
  };
};

const EdgeLayout = ({ nodes, edges }) => (
  <div className="edge-layout">
    <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x="0" y="0" width="0.1" height="0.1" />
      { edges.map((edge, key) => {
        const { from, to, error } = getCoords(nodes, edge);
        if (error) { return null; }
        return <line key={key} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
      }) }
    </svg>
  </div>
);

EdgeLayout.propTypes = {
  edges: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
};

export default EdgeLayout;
