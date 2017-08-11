import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { draggable } from '../../behaviours';

const EnhancedNode = draggable(Node);
const label = node => node.name;

const draggableType = 'NODE';

const handleDropNode = (hits, node) => {
  console.log(hits, node);
};

const NodeBucket = ({ node }) => (
  <div className="node-bucket">
    { node &&
      <EnhancedNode
        label={label(node)}
        onDropped={hits => handleDropNode(hits, node)}
        draggableType={draggableType}
        {...node}
      />
    }
  </div>
);

NodeBucket.propTypes = {
  node: PropTypes.object,
};

NodeBucket.defaultProps = {
  node: null,
};

function mapStateToProps(state) {
  return {
    node: first(state.network.nodes),
  };
}

function mapDispatchToProps() {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeBucket);
