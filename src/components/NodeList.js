import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';
import Node from '../containers/Node';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '../ui/utils/CSSVariables';
import { Node as NodeTransition } from './Transition';
import { scrollable, selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';
import sortOrder from '../utils/sortOrder';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Nodes.
  */
class NodeList extends Component {
  constructor(props) {
    super(props);

    const sorter = sortOrder(props.sortOrder);
    const sortedNodes = sorter(props.items);

    this.state = {
      items: sortedNodes,
      stagger: true,
      exit: true,
    };

    this.refreshTimer = null;
  }

  componentWillReceiveProps(newProps) {
    if (this.refreshTimer) { clearTimeout(this.refreshTimer); }

    // Don't update if items are the same
    if (isEqual(newProps.items, this.props.items)) {
      return;
    }

    const sorter = sortOrder(newProps.sortOrder);
    const sortedNodes = sorter(newProps.items);

    // if we provided the same id, then just update normally
    if (newProps.listId === this.props.listId) {
      this.setState({ exit: false }, () => {
        this.setState({ items: sortedNodes, stagger: false });
      });
      return;
    }

    // Otherwise, transition out and in again
    this.setState({ exit: true }, () => {
      this.setState(
        { items: [], stagger: true },
        () => {
          this.refreshTimer = setTimeout(
            () => this.setState({
              items: sortedNodes,
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
      label,
      isItemSelected,
      onItemClick,
      itemType,
      isOver,
      willAccept,
      meta,
    } = this.props;

    const {
      stagger,
      items,
      exit,
    } = this.state;

    const isSource = !!find(
      items,
      [entityPrimaryKeyProperty, get(meta, entityPrimaryKeyProperty, null)],
    );

    const isValidTarget = !isSource && willAccept;
    const isHovering = isValidTarget && isOver;

    const classNames = cx(
      'node-list',
      { 'node-list--drag': isValidTarget },
    );

    const hoverColor = this.props.hoverColor ? this.props.hoverColor : getCSSVariableAsString('--light-background');

    const styles = isHovering ? { backgroundColor: hoverColor } : {};

    return (
      <TransitionGroup
        className={classNames}
        style={styles}
        exit={exit}
      >
        {
          items.map((node, index) => (
            <NodeTransition
              key={`${node[entityPrimaryKeyProperty]}`}
              index={index}
              stagger={stagger}
            >
              <EnhancedNode
                label={`${label(node)}`}
                selected={isItemSelected(node)}
                onSelected={() => onItemClick(node)}
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
  items: PropTypes.array.isRequired,
  hoverColor: PropTypes.string,
  onItemClick: PropTypes.func,
  itemType: PropTypes.string,
  label: PropTypes.func,
  isItemSelected: PropTypes.func,
  isOver: PropTypes.bool,
  isDragging: PropTypes.bool,
  willAccept: PropTypes.bool,
  meta: PropTypes.object,
  id: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  sortOrder: PropTypes.array,
};

NodeList.defaultProps = {
  items: [],
  hoverColor: null,
  label: () => (''),
  isItemSelected: () => false,
  onItemClick: () => {},
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
