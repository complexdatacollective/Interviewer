import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';

import Node from '../containers/Node';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '../utils/CSSVariables';
import { Node as NodeTransition } from './Transition';
import { NO_SCROLL } from '../behaviours/DragAndDrop/DragManager';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';
import sortOrder from '../utils/sortOrder';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';

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

  componentWillReceiveProps(newProps) {
    // Don't update if nodes are the same
    if (isEqual(newProps.nodes, this.props.nodes)) {
      return;
    }

    const sorter = sortOrder(newProps.sortOrder);
    const sortedNodes = sorter(newProps.nodes);

    // if we provided the same id, then just update normally
    if (newProps.listId === this.props.listId) {
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
      isOver,
      willAccept,
      meta,
    } = this.props;

    const {
      stagger,
      nodes,
      exit,
    } = this.state;

    const isSource = !!find(
      nodes,
      [nodePrimaryKeyProperty, get(meta, nodePrimaryKeyProperty, null)],
    );
    const isValidTarget = !isSource && willAccept;
    const isHovering = isValidTarget && isOver;

    const classNames = cx(
      'node-list',
      { 'node-list--drag': isValidTarget },
    );

    const backgroundColor = getCSSVariableAsString('--light-background');

    const styles = isHovering ? { backgroundColor } : {};

    return (
      <TransitionGroup
        className={classNames}
        style={styles}
        exit={exit}
      >
        {
          nodes.map((node, index) => (
            index < 3 && (
              <NodeTransition
                key={`${node[nodePrimaryKeyProperty]}_${index}`}
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
            )
          ))
        }
      </TransitionGroup>
    );
  }
}

MultiNodeBucket.propTypes = {
  nodes: PropTypes.array.isRequired,
  nodeColor: PropTypes.string,
  itemType: PropTypes.string,
  label: PropTypes.func,
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
  meta: PropTypes.object,
  listId: PropTypes.string.isRequired,
  sortOrder: PropTypes.array,
};

MultiNodeBucket.defaultProps = {
  nodes: [],
  nodeColor: '',
  label: () => (''),
  onDrop: () => {},
  itemType: 'NODE',
  isOver: false,
  willAccept: false,
  isDragging: false,
  meta: {},
  sortOrder: [],
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
)(MultiNodeBucket);

export {
  MultiNodeBucket as UnconnectedMultiNodeBucket,
};
