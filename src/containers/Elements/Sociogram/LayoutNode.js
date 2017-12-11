/* eslint-disable */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { selectable } from '../../../behaviours';
import { DragSource } from '../../../behaviours/DragAndDrop';

const label = node => node.nickname;

const EnhancedNode = compose(
  DragSource,
  selectable,
)(Node);

class LayoutNode extends PureComponent {
  render() {
    const {
      node,
      selected,
      allowPositioning,
      allowSelect,
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
          onSelected={this.props.onSelected}
          selected={selected}
          allowDrag={allowPositioning}
          allowSelect={allowSelect}
          meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
          animate={false}
          {...node}
        />
      </div>
    );
  }
}

LayoutNode.propTypes = {
  onSelected: PropTypes.func.isRequired,
  layoutVariable: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
  selected: PropTypes.bool,
  areaWidth: PropTypes.number,
  areaHeight: PropTypes.number,
};

LayoutNode.defaultProps = {
  allowPositioning: false,
  allowSelect: false,
  selected: false,
  areaWidth: 0,
  areaHeight: 0,
  onSelected: (...args) => { console.log('LayoutNode.onSelected()', args) },
};

export { LayoutNode };

export default LayoutNode;
