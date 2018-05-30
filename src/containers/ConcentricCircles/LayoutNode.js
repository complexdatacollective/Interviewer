import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Node } from '../../components';
import { getNodeLabelFunction } from '../../selectors/interface';
import { selectable } from '../../behaviours';
import { DragSource } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

const EnhancedNode = compose(
  DragSource,
  selectable,
)(Node);

class LayoutNode extends PureComponent {
  render() {
    const {
      allowPositioning,
      allowSelect,
      getLabel,
      layoutVariable,
      linking,
      node,
      selected,
    } = this.props;

    const { x, y } = node[layoutVariable];

    const styles = {
      left: `${100 * x}%`,
      top: `${100 * y}%`,
      transform: 'translate(-50%, -50%)',
    };

    return (
      <div
        className="node-layout__node"
        style={styles}
      >
        <EnhancedNode
          label={getLabel(node)}
          onSelected={this.props.onSelected}
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
  getLabel: PropTypes.func.isRequired,
  layoutVariable: PropTypes.string.isRequired,
  linking: PropTypes.bool,
  node: PropTypes.object.isRequired,
  onSelected: PropTypes.func.isRequired,
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

function mapStateToProps(state) {
  return {
    getLabel: getNodeLabelFunction(state),
  };
}

export { LayoutNode };

export default compose(
  connect(mapStateToProps),
)(LayoutNode);
