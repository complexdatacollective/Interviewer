import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isEqual, isMatch, filter, has, omit } from 'lodash';
import { createSelector } from 'reselect';
import LayoutNode from '../LayoutNode';
import { withBounds } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { makeNetworkNodesOfStageType } from '../../selectors/interface';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const draggableType = 'POSITIONED_NODE';

const propsChangedExcludingNodes = (nextProps, props) =>
  !isEqual(omit(nextProps, 'nodes'), omit(props, 'nodes'));

const nodesLengthChanged = (nextProps, props) =>
  nextProps.nodes.length !== props.nodes.length;

class NodeLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connectFrom: null,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (nodesLengthChanged(nextProps, this.props)) { return true; }
    if (propsChangedExcludingNodes(nextProps, this.props)) { return true; }

    return false;
  }

  onDropNode = () => {
    this.forceUpdate();
  }

  onSelectNode = (node) => {
    const { select } = this.props;

    if (!select && !select.action) { return; }

    switch (select.action) {
      case 'EDGE':
        this.connectNode(node.id); break;
      case 'ATTRIBUTES':
        this.toggleNodeAttributes(node.uid); break;
      default:
    }

    this.forceUpdate();
  }

  connectNode(nodeId) {
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

  toggleNodeAttributes(nodeId) {
    this.props.toggleNodeAttributes({ uid: nodeId }, this.props.attributes);
  }

  isSelected(node) {
    const { select, canSelect } = this.props;
    if (!canSelect) { return false; }
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
    const {
      layout,
      nodes,
      canPosition,
      canSelect,
    } = this.props;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node) => {
            if (!Object.prototype.hasOwnProperty.call(node, layout)) { return null; }

            return (
              <LayoutNode
                key={node.uid}
                layout={layout}
                node={node}
                draggableType={draggableType}
                onSelected={this.onSelectNode}
                onDropped={this.onDropNode}
                selected={this.isSelected(node)}
                canDrag={canPosition}
                canSelect={canSelect}
                areaWidth={this.props.width}
                areaHeight={this.props.height}
                animate={false}
              />
            );
          }) }
        </div>
      </DropZone>
    );
  }
}

NodeLayout.propTypes = {
  nodes: PropTypes.array,
  toggleEdge: PropTypes.func.isRequired,
  toggleNodeAttributes: PropTypes.func.isRequired,
  layout: PropTypes.string.isRequired,
  edge: PropTypes.object,
  select: PropTypes.object,
  attributes: PropTypes.object,
  canPosition: PropTypes.bool,
  canSelect: PropTypes.bool,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

NodeLayout.defaultProps = {
  nodes: [],
  attributes: {},
  edge: null,
  select: null,
  canPosition: false,
  canSelect: false,
};

const propLayout = (_, props) => props.prompt.sociogram.layout;

const makeGetPlacedNodes = () => {
  const networkNodesOfStageType = makeNetworkNodesOfStageType();

  return createSelector(
    [networkNodesOfStageType, propLayout],
    (nodes, layout) => filter(nodes, node => has(node, layout)),
  );
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
      canPosition: !sociogram.select || !sociogram.select.action,
      canSelect: !!sociogram.select,
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(networkActions.toggleEdge, dispatch),
  };
}

export { NodeLayout as NodeLayoutPure };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  withBounds,
)(NodeLayout);
