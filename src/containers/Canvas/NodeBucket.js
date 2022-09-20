import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Node from '../Node';
import LayoutContext from '../../contexts/LayoutContext';
import { DragSource, DropObstacle } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

const EnhancedNode = DragSource(Node);

const NodeBucket = React.forwardRef((props, ref) => {
  const {
    allowPositioning,
    node,
  } = props;

  const {
    allowAutomaticLayout,
  } = useContext(LayoutContext);

  // Don't render a node bucket if:
  // - there are no more nodes to place
  // - automatic layout is enabled
  // - nodes are not allowed to be dragged
  if (!node || !allowPositioning || allowAutomaticLayout) { return null; }

  return (
    <div className="node-bucket" ref={ref}>
      {node
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
});

NodeBucket.propTypes = {
  allowPositioning: PropTypes.bool.isRequired,
};

export { NodeBucket };

export default compose(
  DropObstacle,
)(NodeBucket);
