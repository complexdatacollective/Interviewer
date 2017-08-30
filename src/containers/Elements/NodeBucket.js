import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first, sortBy } from 'lodash';
import { Node } from 'network-canvas-ui';
import { getUnplacedNodes } from '../../selectors/nodes';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

export class NodeBucket extends Component {
  onDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    const { layout, updateNode } = this.props;

    updateNode({ ...node, [layout]: relativeCoords });
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
  sort: PropTypes.object,
};

NodeBucket.defaultProps = {
  node: null,
  sort: null,
};

function getNextNode(nodes, sort) {
  let sortedNodes = [...nodes];
  if (sort && sort.by) { sortedNodes = sortBy([...sortedNodes], sort.by); }
  if (sort && sort.order === 'DESC') { sortedNodes = [...sortedNodes].reverse(); }
  return first(sortedNodes);
}

function mapStateToProps(state, ownProps) {
  const nodes = getUnplacedNodes(ownProps.layout)(state);
  return {
    node: getNextNode(nodes, ownProps.sort),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeBucket);
