import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Node from '../Node';
import { DragSource } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import { getEntityAttributes } from '../../ducks/modules/network';

const EnhancedNode = compose(
  DragSource,
)(Node);

class LayoutNode extends PureComponent {
  render() {
    const {
      allowPositioning,
      allowSelect,
      layoutVariable,
      linking,
      node,
      selected,
      onSelected,
    } = this.props;
    const nodeAttributes = getEntityAttributes(node);

    const { x, y } = nodeAttributes[layoutVariable];

    const styles = {
      left: `${100 * x}%`,
      top: `${100 * y}%`,
      transform: 'translate(-50%, -50%)',
    };

    return (
      <div
        className="node-layout__node"
        style={styles}
        onClick={onSelected}
      >
        <EnhancedNode
          selected={selected}
          linking={linking}
          allowDrag={allowPositioning}
          allowSelect={allowSelect}
          meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
          animate={false}
          scrollDirection={NO_SCROLL}
          {...node}
        />
      </div>
    );
  }
}

LayoutNode.propTypes = {
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
  areaHeight: PropTypes.number,
  areaWidth: PropTypes.number,
  layoutVariable: PropTypes.string.isRequired,
  linking: PropTypes.bool,
  node: PropTypes.object.isRequired,
  onSelected: PropTypes.func,
  selected: PropTypes.bool,
};

LayoutNode.defaultProps = {
  allowPositioning: false,
  allowSelect: false,
  areaHeight: 0,
  areaWidth: 0,
  linking: false,
  onSelected: () => {},
  selected: false,
};

export { LayoutNode };

export default LayoutNode;
