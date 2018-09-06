import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';

import Node from '../containers/Node';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '../utils/CSSVariables';
import { Node as NodeTransition } from './Transition';
import { scrollable, selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';
import sortOrder from '../utils/sortOrder';
import { NodePrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Nodes.
  */
class NodeList extends Component {
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
    if (this.refreshTimer) { clearTimeout(this.refreshTimer); }

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

  componentWillUnmount() {
    if (this.refreshTimer) { clearTimeout(this.refreshTimer); }
  }

  render() {
    const {
      nodeColor,
      label,
      selected,
      onSelect,
      itemType,
      isOver,
      willAccept,
      meta,
      hoverColor,
    } = this.props;

    const {
      stagger,
      nodes,
      exit,
    } = this.state;

    const isSource = !!find(
      nodes,
      [NodePrimaryKeyProperty, get(meta, NodePrimaryKeyProperty, null)],
    );
    const isValidTarget = !isSource && willAccept;
    const isHovering = isValidTarget && isOver;

    const classNames = cx(
      'node-list',
      { 'node-list--drag': isValidTarget },
    );

    const styles = isHovering ? { backgroundColor: hoverColor } : {};

    return (
      <TransitionGroup
        className={classNames}
        style={styles}
        exit={exit}
      >
        {
          nodes.map((node, index) => (
            <NodeTransition
              key={`${node[NodePrimaryKeyProperty]}`}
              index={index}
              stagger={stagger}
            >
              <EnhancedNode
                color={nodeColor}
                label={`${label(node)}`}
                selected={selected(node)}
                onSelected={() => onSelect(node)}
                meta={() => ({ ...node, itemType })}
                itemType={itemType}
                {...node}
              />
            </NodeTransition>
          ))
        }
      </TransitionGroup>
    );
  }
}

NodeList.propTypes = {
  nodes: PropTypes.array.isRequired,
  nodeColor: PropTypes.string,
  hoverColor: PropTypes.string,
  onSelect: PropTypes.func,
  itemType: PropTypes.string,
  label: PropTypes.func,
  selected: PropTypes.func,
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
  meta: PropTypes.object,
  listId: PropTypes.string.isRequired,
  sortOrder: PropTypes.array,
};

NodeList.defaultProps = {
  nodes: [],
  nodeColor: '',
  hoverColor: getCSSVariableAsString('--light-background'),
  label: () => (''),
  selected: () => false,
  onSelect: () => {},
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
  scrollable,
)(NodeList);
