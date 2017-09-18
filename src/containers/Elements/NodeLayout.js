import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { first, isMatch, filter, has } from 'lodash';
import { createSelector } from 'reselect';
import { Node } from 'network-canvas-ui';
import { draggable, withBounds, selectable } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

const propLayout = (_, props) => props.prompt.sociogram.layout;

const makeGetPlacedNodes = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();

  return createSelector(
    [networkNodesOfStageType, propLayout],
    (nodes, layout) => filter(nodes, node => has(node, layout)),
  );
};

const EnhancedNode = draggable(selectable(Node));

const canPosition = position => position === true;
const canSelect = select => !!select;

const asPercentage = decimal => `${decimal * 100}%`;

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

  updateNodeLayout = (hits, { x, y }, node) => {
    const { layout, updateNode } = this.props;
    const hitbox = first(hits);

    // Calculate x/y position as a decimal within the hitbox
    const relativeCoords = {
      type: 'layout',
      x: (x - hitbox.x) / hitbox.width,
      y: (y - hitbox.y) / hitbox.height,
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
    if (!canSelect(select)) { return null; }
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
    const { layout, nodes, position, select } = this.props;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node, key) => {
            if (!Object.prototype.hasOwnProperty.call(node, layout)) { return null; }

            const { x, y } = node[layout];

            const styles = {
              left: asPercentage(x),
              top: asPercentage(y),
            };

            return (
              <div
                key={key}
                className="node-layout__node"
                style={styles}
              >
                <EnhancedNode
                  label={label(node)}
                  draggableType={draggableType}
                  onDropped={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                  onMove={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
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

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();

  return function mapStateToProps(state, props) {
    const sociogram = props.prompt.sociogram;

    return {
      nodes: getPlacedNodes(state, props),
      layout: sociogram.layout,
      edge: sociogram.edge,
      select: sociogram.select,
      position: sociogram.position,
      attributes: sociogram.nodeAttributes,
    };
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
  connect(makeMapStateToProps, mapDispatchToProps),
  withBounds,
)(NodeLayout);
