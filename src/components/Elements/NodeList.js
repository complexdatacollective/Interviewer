import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Node } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, droppable, draggable, selectable } from '../../behaviours';
import styles from '../../ui/styles';

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
      hover,
    } = this.props;

    const classNames = cx(
      'node-list',
      { 'node-list--hover': hover },
    );

    return (
      <StaggeredTransitionGroup
        className={classNames}
        component="div"
        delay={styles.animation.duration.fast * 0.5}
        duration={styles.animation.duration.fast}
        start={styles.animation.duration.slow * 2}
        transitionName="node-list--transition"
        transitionLeave={false}
      >
        { hover &&
          <Node key="placeholder" placeholder />
        }
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
  hover: PropTypes.bool,
};

NodeList.defaultProps = {
  label: () => (''),
  selected: () => false,
  handleSelectNode: () => {},
  handleDropNode: () => {},
  draggableType: '',
  hover: false,
};

export default scrollable(droppable(NodeList));
