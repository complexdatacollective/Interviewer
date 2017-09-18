import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { first, sortBy, reject, has } from 'lodash';
import { Node } from 'network-canvas-ui';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const propSort = (_, props) => props.prompt.sociogram.sort;
const propLayout = (_, props) => props.prompt.sociogram.layout;

const makeGetUnplacedNodes = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();

  return createSelector(
    [networkNodesOfStageType, propLayout],
    (nodes, layout) => reject(nodes, node => has(node, layout)),
  );
};

const makeGetNextUnplacedNode = () => {
  const getUnplacedNodes = makeGetUnplacedNodes();

  return createSelector(
    [getUnplacedNodes, propSort],
    (nodes, sort) => {
      let sortedNodes = [...nodes];
      if (sort && sort.by) { sortedNodes = sortBy([...sortedNodes], sort.by); }
      if (sort && sort.order === 'DESC') { sortedNodes = [...sortedNodes].reverse(); }
      return first(sortedNodes);
    },
  );
};

const draggableType = 'POSITIONED_NODE';

export class NodeBucket extends Component {
  onDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    this.props.updateNode({ ...node, [this.props.layout]: relativeCoords });
  };

  render() {
    const {
      node,
    } = this.props;

    if (!node) { return null; }

    return (
      <div className="node-bucket">
        { node &&
          <EnhancedNode
            label={label(node)}
            onDropped={(hits, coords) => this.onDropNode(hits, coords, node)}
            draggableType={draggableType}
            {...node}
          />
        }
      </div>
    );
  }
}

NodeBucket.propTypes = {
  node: PropTypes.object,
  updateNode: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
};

NodeBucket.defaultProps = {
  node: null,
};

function makeMapStateToProps() {
  const getNextUnplacedNode = makeGetNextUnplacedNode();
  return function mapStateToProps(state, props) {
    return {
      node: getNextUnplacedNode(state, props),
      layout: propLayout(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NodeBucket);
