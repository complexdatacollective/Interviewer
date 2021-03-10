import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { TransitionGroup } from 'react-transition-group';
import { getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import Node from '../containers/Node';
import { Node as NodeTransition } from './Transition';
import { NO_SCROLL } from '../behaviours/DragAndDrop/DragManager';
import { DragSource } from '../behaviours/DragAndDrop';
import sortOrder from '../utils/sortOrder';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedNode = DragSource(Node);

/**
  * Renders a list of Node.
  */
class MultiNodeBucket extends Component {
  constructor(props) {
    super(props);

    const sorter = sortOrder(props.sortOrder);
    const sortedNodes = sorter(props.nodes);

    this.state = {
      nodes: sortedNodes,
      stagger: true,
      exit: true,
    };

    this.refreshTimer = null;
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    const {
      nodes,
      listId,
    } = this.props;
    // Don't update if nodes are the same
    if (isEqual(newProps.nodes, nodes)) {
      return;
    }

    const sorter = sortOrder(newProps.sortOrder);
    const sortedNodes = sorter(newProps.nodes);

    // if we provided the same id, then just update normally
    if (newProps.listId === listId) {
      this.setState({ exit: false }, () => {
        this.setState({ nodes: sortedNodes, stagger: false });
      });
      return;
    }

    // Otherwise, transition out and in again
    this.setState({ exit: true }, () => {
      this.setState(
        { nodes: [], stagger: true },
        () => {
          if (this.refreshTimer) { clearTimeout(this.refreshTimer); }
          this.refreshTimer = setTimeout(
            () => this.setState({
              nodes: sortedNodes,
              stagger: true,
            }),
            getCSSVariableAsNumber('--animation-duration-slow-ms'),
          );
        },
      );
    });
  }

  render() {
    const {
      nodeColor,
      label,
      itemType,
    } = this.props;

    const {
      stagger,
      nodes,
      exit,
    } = this.state;

    return (
      <TransitionGroup
        className="node-list"
        exit={exit}
      >
        {
          nodes.slice(0, 3).map((node, index) => (
            <NodeTransition
              key={`${node[entityPrimaryKeyProperty]}_${index}`}
              index={index}
              stagger={stagger}
            >
              <EnhancedNode
                color={nodeColor}
                inactive={index !== 0}
                allowDrag={index === 0}
                label={`${label(node)}`}
                meta={() => ({ ...node, itemType })}
                scrollDirection={NO_SCROLL}
                {...node}
              />
            </NodeTransition>
          ))
        }
      </TransitionGroup>
    );
  }
}

MultiNodeBucket.propTypes = {
  nodes: PropTypes.array,
  nodeColor: PropTypes.string,
  itemType: PropTypes.string,
  label: PropTypes.func,
  listId: PropTypes.string.isRequired,
  sortOrder: PropTypes.array,
};

MultiNodeBucket.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  itemType: 'NODE',
  sortOrder: [],
};

export default MultiNodeBucket;
