import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first, sortBy } from 'lodash';
import { Node } from 'network-canvas-ui';
import { activePromptLayout } from '../../selectors/session';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

class NodeBucket extends Component {
  handleDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    const { promptLayout, updateNode } = this.props;
    const layouts = { ...node.layouts, [promptLayout]: relativeCoords };

    updateNode({ ...node, layouts });
  };

  render() {
    const {
      node,
    } = this.props;

    return (
      <div className="node-bucket">
        { node &&
          <EnhancedNode
            label={label(node)}
            onDropped={(hits, coords) => this.handleDropNode(hits, coords, node)}
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
  promptLayout: PropTypes.string.isRequired,
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
  return {
    node: getNextNode(ownProps.nodes, ownProps.sort),
    promptLayout: activePromptLayout(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeBucket);
