import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { first, isMatch } from 'lodash';
import { Node } from 'network-canvas-ui';
import { draggable, withBounds, selectable } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { getPlacedNodes } from '../../selectors/nodes';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

const EnhancedNode = draggable(selectable(Node));

const canPosition = position => position === true;
const canSelect = select => !!select;

export class NodeLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connectFrom: null,
    };
  }

  onSelectNode = (node) => {
    const { select } = this.props;

    if (!select && !select.action) { return; }

    switch (select.action) {
      case 'EDGE':
        this.connectNode(node); break;
      case 'ATTRIBUTES':
        this.toggleNodeAttributes(node); break;
      default:
    }
  };

  updateNodeLayout = (hits, coords, node) => {
    const { layout, updateNode } = this.props;
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    updateNode({ ...node, [layout]: relativeCoords });
  }

  connectNode(node) {
    const nodeId = node.id;
    const edgeType = this.props.edge.type;
    const connectFrom = this.state.connectFrom;

    if (!connectFrom) {
      this.setState({ connectFrom: nodeId });
      return;
    }

    if (connectFrom !== nodeId) {
      this.props.toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: edgeType,
      });
    }

    this.setState({ connectFrom: null });
  }

  toggleNodeAttributes(node) {
    this.props.toggleNodeAttributes(node, this.props.attributes);
  }

  isSelected(node) {
    const { select } = this.props;
    if (!select) { return null; }
    switch (select.action) {
      case 'EDGE':
        return (node.id === this.state.connectFrom);
      case 'ATTRIBUTES':
        return isMatch(node, this.props.attributes);
      default:
        return false;
    }
  }

  render() {
    const { layout, nodes, width, height, position, select } = this.props;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node, key) => {
            if (!Object.prototype.hasOwnProperty.call(node, layout)) { return null; }

            const x = node[layout].x * width;
            const y = node[layout].y * height;

            return (
              <div key={key} className="node-layout__node" style={{ left: `${x}px`, top: `${y}px` }}>
                <EnhancedNode
                  label={label(node)}
                  draggableType={draggableType}
                  onDropped={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                  onDrag={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                  onSelected={() => this.onSelectNode(node)}
                  selected={this.isSelected(node)}
                  canDrag={canPosition(position)}
                  canSelect={canSelect(select)}
                  animate={false}
                  {...node}
                />
              </div>
            );
          }) }
        </div>
      </DropZone>
    );
  }
}

NodeLayout.propTypes = {
  nodes: PropTypes.array,
  updateNode: PropTypes.func.isRequired,
  toggleEdge: PropTypes.func.isRequired,
  toggleNodeAttributes: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layout: PropTypes.string.isRequired,
  edge: PropTypes.object,
  select: PropTypes.object,
  position: PropTypes.bool,
  attributes: PropTypes.object,
};

NodeLayout.defaultProps = {
  nodes: [],
  attributes: {},
  edge: null,
  select: null,
  position: false,
};

function mapStateToProps(state, ownProps) {
  return {
    nodes: getPlacedNodes(ownProps.layout)(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(networkActions.toggleEdge, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withBounds,
)(NodeLayout);
