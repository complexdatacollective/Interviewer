import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { selectable } from '../behaviours';
import { actionCreators as networkActions } from '../ducks/modules/network';
import { DragSource } from '../behaviours/DragAndDrop';

const label = node => node.nickname;

const EnhancedNode = DragSource(selectable(Node));

class LayoutNode extends PureComponent {
  onDropped = (...args) => {
    this.onMove(...args);
    this.props.onDropped();
  }

  onMove = (hits, { x, y }) => {
    const { layoutVariable, updateNode, node: { uid } } = this.props;
    const hitbox = first(hits);

    // Calculate x/y position as a decimal within the hitbox
    const relativeCoords = {
      type: 'layout',
      x: (x - hitbox.x) / hitbox.width,
      y: (y - hitbox.y) / hitbox.height,
    };

    updateNode({ uid, [layoutVariable]: relativeCoords });
  }

  onSelected = () => {
    this.props.onSelected(this.props.node);
  }

  render() {
    const {
      node,
      draggableType,
      selected,
      canDrag,
      canSelect,
      layoutVariable,
      areaWidth,
      areaHeight,
    } = this.props;

    const { x, y } = node[layoutVariable];

    const styles = {
      left: 0,
      top: 0,
      transform: `translate(calc(${x * areaWidth}px - 50%), calc(${y * areaHeight}px - 50%))`,
    };

    return (
      <div
        className="node-layout__node"
        style={styles}
      >
        <EnhancedNode
          label={label(node)}
          draggableType={draggableType}
          onDropped={this.onDropped}
          onMove={this.onMove}
          onSelected={this.onSelected}
          selected={selected}
          canDrag={canDrag}
          canSelect={canSelect}
          animate={false}
          {...node}
        />
      </div>
    );
  }
}

LayoutNode.propTypes = {
  onDropped: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired,
  layoutVariable: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
  draggableType: PropTypes.string.isRequired,
  canDrag: PropTypes.bool,
  canSelect: PropTypes.bool,
  selected: PropTypes.bool,
  areaWidth: PropTypes.number,
  areaHeight: PropTypes.number,
};

LayoutNode.defaultProps = {
  canDrag: false,
  canSelect: false,
  selected: false,
  areaWidth: 0,
  areaHeight: 0,
};

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export { LayoutNode };
export default connect(null, mapDispatchToProps)(LayoutNode);
