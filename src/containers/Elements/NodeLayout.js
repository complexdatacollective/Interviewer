import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { first } from 'lodash';
import { Node } from 'network-canvas-ui';
import { draggable, withBounds } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { activePromptLayout as getPromptLayout } from '../../selectors/session';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

class NodeLayout extends Component {
  handleDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    const { promptLayout, updateNode } = this.props;

    updateNode({ ...node, [promptLayout]: relativeCoords });
  };

  render() {
    const { promptLayout, nodes, width, height } = this.props;

    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType={draggableType}>
        <div className="node-layout">
          { nodes.map((node, key) => {
            if (!Object.prototype.hasOwnProperty.call(node, promptLayout)) { return null; }

            const x = node[promptLayout].x * width;
            const y = node[promptLayout].y * height;

            return (
              <div key={key} className="node-layout__node" style={{ left: `${x}px`, top: `${y}px` }}>
                <EnhancedNode
                  label={label(node)}
                  draggableType={draggableType}
                  onDropped={(hits, coords) => this.handleDropNode(hits, coords, node)}
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
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  promptLayout: PropTypes.string.isRequired,
};

NodeLayout.defaultProps = {
  nodes: [],
};

function mapStateToProps(state) {
  return {
    promptLayout: getPromptLayout(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withBounds,
)(NodeLayout);
