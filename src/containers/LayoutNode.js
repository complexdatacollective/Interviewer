/* eslint-disable */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { draggable, selectable } from '../behaviours';
import { actionCreators as networkActions } from '../ducks/modules/network';

const label = node => node.nickname;

const EnhancedNode = draggable(selectable(Node));

class LayoutNode extends PureComponent {
  onDropped = (...args) => {
    this.onMove(...args);
    this.props.onDropped();
  }

  onMove = (hits, { x, y }) => {
    const { layout, updateNode, node: { uid } } = this.props;
    const hitbox = first(hits);

    // Calculate x/y position as a decimal within the hitbox
    const relativeCoords = {
      type: 'layout',
      x: (x - hitbox.x) / hitbox.width,
      y: (y - hitbox.y) / hitbox.height,
    };

    updateNode({ uid, [layout]: relativeCoords });
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
      layout,
      areaWidth,
      areaHeight,
    } = this.props;

    const { x, y } = node[layout];

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
  layout: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
  draggableType: PropTypes.string.isRequired,
  canDrag: PropTypes.bool,
  canSelect: PropTypes.bool,
  selected: PropTypes.bool,
};

LayoutNode.defaultProps = {
  canDrag: false,
  canSelect: false,
  selected: false,
};

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export { LayoutNode as LayoutNodePure };
export default connect(null, mapDispatchToProps)(LayoutNode);
