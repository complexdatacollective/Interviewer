import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { activePromptLayout } from '../../selectors/session';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'NODE_BUCKET';

class NodeBucket extends Component {
  handleDropNode = (hits, coords, node) => {
    const { promptLayout, updateNode } = this.props;
    const layouts = { ...node.layouts, [promptLayout]: coords };

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
};

NodeBucket.defaultProps = {
  node: null,
};

function mapStateToProps(state, ownProps) {
  return {
    node: first(ownProps.nodes),  // TODO: configurable ordering
    promptLayout: activePromptLayout(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeBucket);
