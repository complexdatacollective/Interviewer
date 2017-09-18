import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { filter, find } from 'lodash';
import { colorDictionary } from 'network-canvas-ui';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';

const propSociogramLayout = (_, props) => props.prompt.sociogram.layout;
const propSociogramEdgeType = (_, props) => props.prompt.sociogram.edge.type;
const networkEdges = state => state.network.edges;

const makeNetworkEdgesOfSociogramType = () =>
  createSelector(
    [networkEdges, propSociogramEdgeType],
    (edges, type) => filter(edges, { type }),
  );

const makeEdgeCoordsForSociogram = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();
  const networkEdgesOfSociogramType = makeNetworkEdgesOfSociogramType();

  return createSelector(
    [networkNodesOfStageType, networkEdgesOfSociogramType, propSociogramLayout],
    (nodes, edges, layout) =>
      edges.map((edge) => {
        const from = find(nodes, ['id', edge.from]);
        const to = find(nodes, ['id', edge.to]);

        if (!from || !to) { return { from: null, to: null }; }

        return {
          key: `${edge.from}_${edge.type}_${edge.to}`,
          from: from[layout],
          to: to[layout],
        };
      }),
    );
};

export const EdgeLayout = ({ edgeCoords, color }) => {
  const strokeColor = color ? colorDictionary[color] : colorDictionary['edge-base'];

  return (
    <div className="edge-layout">
      <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        { edgeCoords.map(({ key, from, to }) => {
          if (!from || !to) { return null; }
          return (
            <line
              key={key}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={strokeColor}
            />
          );
        }) }
      </svg>
    </div>
  );
};

EdgeLayout.propTypes = {
  edgeCoords: PropTypes.array.isRequired,
  color: PropTypes.string,
};

EdgeLayout.defaultProps = {
  color: null,
};

function makeMapStateToProps() {
  const edgeCoordsForSociogram = makeEdgeCoordsForSociogram();

  return function mapStateToProps(state, props) {
    const sociogram = props.prompt.sociogram;

    return {
      color: sociogram.edge.color,
      edgeCoords: edgeCoordsForSociogram(state, props),
    };
  };
}

export default connect(makeMapStateToProps)(EdgeLayout);
