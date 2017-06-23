import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Node } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable, draggable, selectable } from '../../behaviours';

const EnhancedNode = draggable(selectable(Node));

/**
  * Renders a list of Node.
  */
class NodeList extends Component {
  componentDidMount() {
  }

  render() {
    const {
      network: { nodes },
      label,
      selected,
      handleSelectNode,
      handleDropNode,
      draggableType,
    } = this.props;

    return (
      <StaggeredTransitionGroup
        className="node-list"
        component="div"
        delay={150}
        duration={300}
        start={2000}
        transitionName="fade"
        transitionLeave={false}
      >
        {
          nodes.map(node => (
            <span key={node.uid}>
              <EnhancedNode
                label={label(node)}
                selected={selected(node)}
                onSelected={() => handleSelectNode(node)}
                onDropped={hits => handleDropNode(hits, node)}
                draggableType={draggableType}
                {...node}
              />
            </span>
          ))
        }
      </StaggeredTransitionGroup>
    );
  }
}

NodeList.propTypes = {
  network: PropTypes.any.isRequired,
  handleSelectNode: PropTypes.func,
  handleDropNode: PropTypes.func,
  label: PropTypes.func,
  selected: PropTypes.func,
  draggableType: PropTypes.string,
};

NodeList.defaultProps = {
  label: () => (''),
  selected: () => false,
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
};

export default droppable(scrollable(NodeList));
