import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { first, isMatch } from 'lodash';
import { Node } from 'network-canvas-ui';
import { draggable, withBounds, selectable } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { activePrompt } from '../../selectors/session';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

const EnhancedNode = draggable(selectable(Node));

export class NodeLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connectFrom: null,
    };
  }

  onSelectNode = (node) => {
    if (!this.props.prompt.selectAction) { return; }

    switch (this.props.prompt.selectAction) {
      case 'EDGE':
        this.connectNode(node); break;
      case 'ATTRIBUTES':
        this.toggleNodeAttributes(node); break;
      default:
    }
  };

  updateNodeLayout = (hits, coords, node) => {
    const { prompt, updateNode } = this.props;
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    updateNode({ ...node, [prompt.layout]: relativeCoords });
  }

  connectNode(node) {
    const nodeId = node.id;
    const edgeType = this.props.prompt.edgeType;
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
    this.props.toggleNodeAttributes(node, this.props.prompt.nodeAttributes);
  }

  isSelected(node) {
    switch (this.props.prompt.selectAction) {
      case 'EDGE':
        return (node.id === this.state.connectFrom);
      case 'ATTRIBUTES':
        return isMatch(node, this.props.prompt.nodeAttributes);
      default:
        return false;
    }
  }

  render() {
    const { prompt, nodes, width, height } = this.props;

    const canDrag = Object.prototype.hasOwnProperty.call(prompt, 'canDrag') ? prompt.canDrag : true;
    const canSelect = Object.prototype.hasOwnProperty.call(prompt, 'canSelect') ? prompt.canSelect : true;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node, key) => {
            if (!Object.prototype.hasOwnProperty.call(node, prompt.layout)) { return null; }

            const x = node[prompt.layout].x * width;
            const y = node[prompt.layout].y * height;

            return (
              <div key={key} className="node-layout__node" style={{ left: `${x}px`, top: `${y}px` }}>
                <EnhancedNode
                  label={label(node)}
                  draggableType={draggableType}
                  onDropped={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                  onDrag={(hits, coords) => this.updateNodeLayout(hits, coords, node)}
                  onSelected={() => this.onSelectNode(node)}
                  selected={this.isSelected(node)}
                  canDrag={canDrag}
                  canSelect={canSelect}
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
  prompt: PropTypes.object.isRequired,
};

NodeLayout.defaultProps = {
  nodes: [],
};

function mapStateToProps(state) {
  return {
    prompt: activePrompt(state),
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
