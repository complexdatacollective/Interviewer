import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, isEqual } from 'lodash';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Node from '../containers/Node';
import { Node as NodeTransition } from './Transition';
import { scrollable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';
import createSorter from '../utils/createSorter';
import { get } from '../utils/lodash-replacements';

const EnhancedNode = DragSource(Node);

/**
  * Renders a list of Nodes.
  */
class NodeList extends Component {
  constructor(props) {
    super(props);

    const sorter = createSorter(props.sortOrder);
    const sortedNodes = sorter(props.items);

    this.state = {
      items: sortedNodes,
      stagger: true,
      exit: true,
    };

    this.refreshTimer = null;
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(newProps) {
    const {
      items,
      listId,
      disableDragNew,
    } = this.props;

    if (this.refreshTimer) { clearTimeout(this.refreshTimer); }

    // Don't update if items are the same
    if (isEqual(newProps.items, items) && isEqual(newProps.disableDragNew, disableDragNew)) {
      return;
    }

    const sorter = createSorter(newProps.sortOrder);
    const sortedNodes = sorter(newProps.items);
    // if we provided the same id, then just update normally
    if (newProps.listId === listId) {
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
      onItemClick,
      itemType,
      isOver,
      willAccept,
      meta,
      hoverColor,
      className,
      stage: {
        id: stageId,
      },
      disableDragNew,
      externalData,
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
      className,
      { 'node-list--drag': isValidTarget },
    );

    const hoverBackgroundColor = hoverColor || getCSSVariableAsString('--light-background');

    const styles = isHovering ? { backgroundColor: hoverBackgroundColor } : {};

    return (
      <TransitionGroup
        className={classNames}
        style={styles}
        exit={exit}
      >
        {
          items.map((node, index) => {
            const isDraggable = !(externalData && disableDragNew)
              && !(disableDragNew && node.stageId !== stageId);

            return (
              <NodeTransition
                key={`${node[entityPrimaryKeyProperty]}`}
                index={index}
                stagger={stagger}
              >
                <div onClick={() => onItemClick(node)}>
                  <EnhancedNode
                    allowDrag={isDraggable}
                    label={`${label(node)}`}
                    meta={() => ({ ...node, itemType })}
                    itemType={itemType}
                    {...node}
                  />
                </div>
              </NodeTransition>
            );
          })
        }
      </TransitionGroup>
    );
  }
}

NodeList.propTypes = {
  disableDragNew: PropTypes.bool,
  stage: PropTypes.object.isRequired,
  className: PropTypes.string,
  hoverColor: PropTypes.string,
  id: PropTypes.string.isRequired,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  items: PropTypes.array,
  itemType: PropTypes.string,
  label: PropTypes.func,
  listId: PropTypes.string.isRequired,
  meta: PropTypes.object,
  onDrop: PropTypes.func,
  onItemClick: PropTypes.func,
  sortOrder: PropTypes.array,
  willAccept: PropTypes.bool,
};

NodeList.defaultProps = {
  disableDragNew: false,
  className: null,
  hoverColor: null,
  isDragging: false,
  isOver: false,
  items: [],
  itemType: 'NODE',
  label: () => (''),
  meta: {},
  onDrop: () => { },
  onItemClick: () => { },
  sortOrder: [],
  willAccept: false,
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(NodeList);
