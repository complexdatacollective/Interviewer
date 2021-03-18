import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Node from '../Node';
import { DragSource, DropObstacle } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import { entityPrimaryKeyProperty } from '../../ducks/modules/network';

const EnhancedNode = DragSource(Node);

class NodeBucket extends PureComponent {
  render() {
    const {
      allowPositioning,
      node,
    } = this.props;

    if (!allowPositioning || !node) { return null; }

    return (
      <div className="node-bucket">
        { node
          && (
          <EnhancedNode
            key={node[entityPrimaryKeyProperty]}
            meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
            scrollDirection={NO_SCROLL}
            {...node}
          />
          )}
      </div>
    );
  }
}

NodeBucket.propTypes = {
  allowPositioning: PropTypes.bool.isRequired,
  node: PropTypes.any,
};

NodeBucket.defaultProps = {
  node: null,
};

export { NodeBucket };

export default compose(
  DropObstacle,
)(NodeBucket);
