import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first, isMatch, omit } from 'lodash';
import { Node } from 'network-canvas-ui';
import { activePromptAttributes } from '../../selectors/session';
import { restOfNetwork } from '../../selectors/network';
import { draggable } from '../../behaviours';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.name;

const draggableType = 'NODE_BUCKET';

class NodeBucket extends Component {
  handleDropNode = (hits, node) => {
    const { promptAttributes, updateNode } = this.props;

    console.log(hits, node);

    if (isMatch(node, promptAttributes)) {
      updateNode(
        omit(node, Object.getOwnPropertyNames(promptAttributes)),
      );
    } else {
      updateNode({ ...node, ...promptAttributes });
    }
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
            onDropped={hits => this.handleDropNode(hits, node)}
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
  promptAttributes: PropTypes.object.isRequired,
};

NodeBucket.defaultProps = {
  node: null,
};

function mapStateToProps(state) {
  return {
    node: first(restOfNetwork(state).nodes),  // TODO: configurable ordering
    promptAttributes: activePromptAttributes(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeBucket);
