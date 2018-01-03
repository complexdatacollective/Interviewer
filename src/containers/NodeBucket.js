import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Node } from 'network-canvas-ui';
import { makeGetNextUnplacedNode, makeGetSociogramOptions } from '../selectors/sociogram';
import { DragSource } from '../behaviours/DragAndDrop';

const EnhancedNode = DragSource(Node);
const label = node => node.nickname;

class NodeBucket extends Component {
  static propTypes = {
    node: PropTypes.object,
  };

  static defaultProps = {
    node: null,
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
            meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
            {...node}
          />
        }
      </div>
    );
  }
}

function makeMapStateToProps() {
  const getNextUnplacedNode = makeGetNextUnplacedNode();
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      node: getNextUnplacedNode(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

export { NodeBucket };

export default compose(
  connect(makeMapStateToProps),
)(NodeBucket);
