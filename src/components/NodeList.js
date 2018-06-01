import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import sorty from '@zippytech/sorty';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';
import { Node } from '../components';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '../utils/CSSVariables';
import { Node as NodeTransition } from './Transition';
import { scrollable, selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Nodes.
  */
class NodeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: props.nodes,
      stagger: true,
      exit: true,
    };

    this.refreshTimer = null;
  }

  componentWillReceiveProps(newProps) {
    if (this.refreshTimer) { clearTimeout(this.refreshTimer); }

    // Don't update if nodes are the same
    if (isEqual(newProps.nodes, this.state.nodes)) {
      return;
    }

    const newSortedNodes = newProps.nodes;

    if (newProps.sortOrder && newProps.sortOrder.length) {
      sorty(newProps.sortOrder, newSortedNodes);
    }

    // if we provided the same id, then just update normally
    if (newProps.listId === this.props.listId) {
      this.setState({ exit: false }, () => {
        this.setState({ nodes: newSortedNodes, stagger: false });
      });
      return;
    }

    // Otherwise, transition out and in again
    this.props.scrollTop(0);

    this.setState({ exit: true }, () => {
      this.setState(
        { nodes: [], stagger: true },
        () => {
          this.refreshTimer = setTimeout(
            () => this.setState({
              nodes: newSortedNodes,
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

    const isSource = !!find(nodes, ['uid', get(meta, 'uid', null)]);
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
              key={`${node.uid}`}
              index={index}
              stagger={stagger}
            >
              <EnhancedNode
                color={nodeColor}
                label={`${label(node)}`}
                selected={selected(node)}
                onSelected={() => onSelect(node)}
                meta={() => ({ ...node, itemType })}
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
  scrollTop: PropTypes.func,
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
  scrollTop: () => {},
  sortOrder: [],
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(NodeList);
