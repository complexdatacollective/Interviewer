import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import cx from 'classnames';
import Color from 'color';
import { Node, colorDictionary } from 'network-canvas-ui';
import { TransitionGroup } from 'react-transition-group';
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
 * @class NodeList
 *
 * Renders a list of Nodes.
 *
 * @param { string } props.listId A unique identifier for this list.
 *    Note: `key` is not used, to simplify the animations used to re-render lists.
 *
 * @description
 * Notes on state/props:
 *
 * `props.nodes` are copied to state so that they can be modified out of sync
 * from props. For example, so that we can modify the transition properties
 * of previously-displayed nodes in response to props changes before displaying
 * the new nodes.
 *
 * `listId` is similarly copied to state, as it is used (in conjunction with
 * node.uid) to identify a group of nodes. If the same node appears in two lists,
 * then it is logically separate so that it still disappears & reappears with
 * the rest of its group.
 */
class NodeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: props.nodes,
      stagger: true,
      exit: true,
      waitForExitAnimation: true,
    };

    this.refreshTimer = null;
  }

  componentWillReceiveProps(newProps) {
    // Don't update node display if nodes are the same
    if (isEqual(newProps.nodes, this.state.nodes)) {
      return;
    }

    // if we provided the same id, then just update normally
    if (newProps.listId === this.props.listId) {
      this.setState({ exit: false }, () => {
        this.setState({
          nodes: newProps.nodes,
          waitForExitAnimation: false,
          stagger: false,
        });
      });
      return;
    }

    // Otherwise, transition out and in again
    this.props.scrollTop(0);

    // First, ensure that exit animations are enabled for previous nodes
    this.setState({ exit: true }, () => {
      // Then transition new ones in
      this.setState({
        listId: newProps.listId,
        nodes: newProps.nodes,
        stagger: true,
        // Even if there were no previous nodes, include the pause
        waitForExitAnimation: true,
      });
    });
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
    } = this.props;

    const {
      stagger,
      exit,
      listId,
      nodes,
      waitForExitAnimation,
    } = this.state;

    const isSource = !!find(nodes, ['uid', get(meta, 'uid', null)]);
    const isValidTarget = !isSource && willAccept;
    const isHovering = isValidTarget && isOver;

    const classNames = cx(
      'node-list',
      { 'node-list--drag': isValidTarget },
    );

    const backgroundColor = Color(
      nodeColor || colorDictionary['node-base'],
    ).alpha(0.1);

    const styles = isHovering ? { backgroundColor } : {};

    return (
      <TransitionGroup
        className={classNames}
        style={styles}
        exit={exit}
      >
        {
          nodes.map((node, index) => (
            <NodeTransition
              key={`${listId}-${node.uid}`}
              index={index}
              stagger={stagger}
              waitForPreviousExit={waitForExitAnimation}
              listId={listId}
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
  onSelect: PropTypes.func,
  itemType: PropTypes.string,
  label: PropTypes.func,
  selected: PropTypes.func,
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
  meta: PropTypes.object,
  listId: PropTypes.string.isRequired,
  scrollTop: PropTypes.func,
};

NodeList.defaultProps = {
  nodes: [],
  nodeColor: '',
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
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(NodeList);
