import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { first, sortBy, reject, has, map } from 'lodash';
import { Node } from 'network-canvas-ui';
import { networkNodesOfStageType } from '../../selectors/interface';
import { draggable } from '../../behaviours';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const propSort = (_, props) => {
  if (props.prompt.sociogram) {
    return props.prompt.sociogram.sort;
  } else if (props.prompt.bins) {
    return props.prompt.bins.sort;
  }
  return null;
};
const propLayout = (_, props) => {
  if (props.prompt.sociogram) {
    return props.prompt.sociogram.layout;
  } else if (props.prompt.bins) {
    return props.prompt.bins.layout;
  }
  return null;
};

const getUnplacedNodes = createSelector(
  [networkNodesOfStageType, propLayout],
  (nodes, layout) => reject(nodes, node => has(node, layout)),
);

const getNextUnplacedNode = createSelector(
  [getUnplacedNodes, propSort],
  (nodes, sort) => {
    let sortedNodes = [...nodes];
    if (sort && sort.by) { sortedNodes = sortBy([...sortedNodes], sort.by); }
    if (sort && sort.order === 'DESC') { sortedNodes = [...sortedNodes].reverse(); }
    if (sort && sort.number) { return sortedNodes.slice(0, sort.number - 1); }
    return [first(sortedNodes)];
  },
);

// first one draggable, rest in disabled state

const draggableType = 'POSITIONED_NODE';

export class NodeBucket extends Component {
  render() {
    const {
      nodes,
    } = this.props;

    if (!nodes) { return null; }

    return (
      <div className="node-bucket">
        {map(nodes, (node, i) =>
          node &&
          <EnhancedNode
            label={label(node)}
            onDropped={(hits, coords) => this.onDropNode(hits, coords, node)}
            draggableType={draggableType}
            {...node}
            key={i}
          />,
        )}
      </div>
    );
  }
}

NodeBucket.propTypes = {
  nodes: PropTypes.array,
  onDropNode: PropTypes.func.isRequired,
  layout: PropTypes.string,
};

NodeBucket.defaultProps = {
  nodes: null,
  layout: 'ordinalBin',
};

function mapStateToProps(state, props) {
  return {
    nodes: getNextUnplacedNode(state, props),
    layout: propLayout(state, props),
  };
}

export default connect(mapStateToProps)(NodeBucket);
