/* eslint-disable */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { throttle, first } from 'lodash';
import { Node } from 'network-canvas-ui';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';
import { draggable } from '../../behaviours';
import { DropZone } from '../../components/Elements';
import { activePromptLayout } from '../../selectors/session';
import { actionCreators as networkActions } from '../../ducks/modules/network';

const EnhancedNode = draggable(Node);
const label = node => node.nickname;

const draggableType = 'POSITIONED_NODE';

class NodeLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      y: 0,
      x: 0,
    };

    this.trackSize = throttle(this.trackSize, 1000 / 16);  // 24fps max
  }

  componentDidMount() {
    this.trackSize();
    window.addEventListener('resize', this.trackSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.trackSize);
  }

  trackSize = () => {
    const boundingClientRect = getAbsoluteBoundingRect(this.node);

    this.setState({
      width: boundingClientRect.width,
      height: boundingClientRect.height,
      y: boundingClientRect.top,
      x: boundingClientRect.left,
    });
  }

  handleDropNode = (hits, coords, node) => {
    const hit = first(hits);
    const relativeCoords = {
      x: (coords.x - hit.x) / hit.width,
      y: (coords.y - hit.y) / hit.height,
    };

    const { promptLayout, updateNode } = this.props;
    const layouts = { ...node.layouts, [promptLayout]: relativeCoords };

    updateNode({ ...node, layouts });
  };

  render() {
    const { promptLayout, nodes, activePromptLayout } = this.props;
    console.log(nodes);
    return (
      <DropZone droppableName="NODE_LAYOUT" acceptsDraggableType="POSITIONED_NODE">
        <div
          className="node-layout"
          ref={(node) => { this.node = node; }}
        >
          { nodes.map((node, key) => {

            if (!Object.prototype.hasOwnProperty.call(node.layouts, promptLayout)) { return; }

            const x = node.layouts[promptLayout].x * this.state.width;
            const y = node.layouts[promptLayout].y * this.state.height;

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
};

NodeLayout.defaultProps = {
  nodes: [],
};

function mapStateToProps(state) {
  return {
    promptLayout: activePromptLayout(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(networkActions.updateNode, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeLayout);
