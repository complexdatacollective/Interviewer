import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isEqual, isMatch, omit } from 'lodash';
import LayoutNode from '../LayoutNode';
import { withBounds } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { makeGetSociogramOptions, makeGetPlacedNodes, sociogramOptionsProps } from '../../selectors/sociogram';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const draggableType = 'POSITIONED_NODE';

const propsChangedExcludingNodes = (nextProps, props) =>
  !isEqual(omit(nextProps, 'nodes'), omit(props, 'nodes'));

const nodesLengthChanged = (nextProps, props) =>
  nextProps.nodes.length !== props.nodes.length;

class NodeLayout extends Component {
  static propTypes = {
    nodes: PropTypes.array,
    toggleEdge: PropTypes.func.isRequired,
    toggleHighlight: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    nodes: [],
  };

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
    const { canSelect, selectMode } = this.props;

    if (!canSelect) { return; }

    switch (selectMode) {
      case 'EDGE':
        this.connectNode(node.id); break;
      case 'HIGHLIGHT':
        this.toggleHighlightAttributes(node.uid); break;
      default:
    }

    this.forceUpdate();
  }

  connectNode(nodeId) {
    const { createEdge } = this.props;
    const { connectFrom } = this.state;

    if (!connectFrom) {
      this.setState({ connectFrom: nodeId });
      return;
    }

    if (connectFrom !== nodeId) {
      this.props.toggleEdge({
        from: connectFrom,
        to: nodeId,
        type: createEdge,
      });
    }

    this.setState({ connectFrom: null });
  }

  toggleHighlightAttributes(nodeId) {
    this.props.toggleNodeAttributes(
      { uid: nodeId },
      this.highlightAttributes(),
    );
  }

  isSelected(node) {
    const { selectMode, canSelect } = this.props;

    if (!canSelect) { return false; }

    switch (selectMode) {
      case 'EDGE':
        return (node.id === this.state.connectFrom);
      case 'HIGHLIGHT':
        return isMatch(node, this.highlightAttributes());
      default:
        return false;
    }
  }

  render() {
    const {
      nodes,
      width,
      height,
      allowPositioning,
      allowSelect,
      layoutVariable,
    } = this.props;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node) => {
            if (!Object.prototype.hasOwnProperty.call(node, layoutVariable)) { return null; }

            return (
              <LayoutNode
                key={node.uid}
                layoutVariable={layoutVariable}
                node={node}
                draggableType={draggableType}
                onSelected={this.onSelectNode}
                onDropped={this.onDropNode}
                selected={this.isSelected(node)}
                canDrag={allowPositioning}
                canSelect={allowSelect}
                areaWidth={width}
                areaHeight={height}
                animate={false}
              />
            );
          }) }
        </div>
      </DropZone>
    );
  }
}

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      nodes: getPlacedNodes(state, props),
      ...getSociogramOptions(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleHighlight: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
    toggleEdge: bindActionCreators(networkActions.toggleEdge, dispatch),
  };
}

export { NodeLayout as NodeLayoutPure };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  withBounds,
)(NodeLayout);
