import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { isEqual, isMatch, omit } from 'lodash';
import LayoutNode from '../LayoutNode';
import { withBounds } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { propPromptLayout, propPromptCreateEdges, makeGetPlacedNodes } from '../../selectors/sociogram';
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
    if (!this.canSelect()) { return; }

    switch (this.selectAction()) {
      case 'EDGE':
        this.connectNode(node.id); break;
      case 'HIGHLIGHT':
        this.toggleHighlightAttributes(node.uid); break;
      default:
    }

    this.forceUpdate();
  }

  connectNode(nodeId) {
    const { create: edgeType } = this.props.props.edge;
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

  toggleHighlightAttributes(nodeId) {
    this.props.toggleNodeAttributes(
      { uid: nodeId },
      this.highlightAttributes(),
    );
  }

  highlightAttributes() {
    const { highlight } = this.props.prompt;
    return {
      [highlight.variable]: highlight.value,
    };
  }

  selectAction() {
    if(edges.create) { return 'EDGE'; }
    if(highlight.allowHighlighting) { return 'HIGHLIGHT'; }
  }

  isSelected(node) {
    const { edges, highlight } = this.props.prompt;
  
    if (!this.canSelect()) { return false; }

    switch (this.selectAction()) {
      case 'EDGE':
        return (node.id === this.state.connectFrom);
      case 'HIGHLIGHT':
        return isMatch(node, this.highlightAttributes());
      default:
        return false;
    }
  }

  canSelect() {
    return !!(this.props.prompt.edges.create || this.props.prompt.highlight.allowHighlighting);
  }

  canDrag() {
    return this.props.prompt.layout.allowPositioning;
  }

  render() {

    const {
      nodes,
      layout,
      width,
      height
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
                canDrag={this.canPosition()}
                canSelect={this.canSelect()}
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

NodeLayout.propTypes = {
  nodes: PropTypes.array,
  toggleEdge: PropTypes.func.isRequired,
  toggleHighlight: PropTypes.func.isRequired,
  attributes: PropTypes.object,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

NodeLayout.defaultProps = {
  nodes: [],
  attributes: {},
};

function makeMapStateToProps() {
  const getPlacedNodes = makeGetPlacedNodes();

  return function mapStateToProps(state, props) {
    return {
      nodes: getPlacedNodes(state, props),
      layout: this.props.prompt.layout.layoutVariable,
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
