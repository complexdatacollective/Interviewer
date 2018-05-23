import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get, isEqual } from 'lodash';
import cx from 'classnames';
import { TransitionGroup } from 'react-transition-group';
import { Node } from '../ui/components/';
import { getCSSVariableAsString, getCSSVariableAsNumber } from '../utils/CSSVariables';
import { Node as NodeTransition } from './Transition';
import { selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Node.
  */
class OrdinalBinBucket extends Component {
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
    // Don't update if nodes are the same
    if (isEqual(newProps.nodes, this.state.nodes)) {
      return;
    }

    // if we provided the same id, then just update normally
    if (newProps.listId === this.props.listId) {
      this.setState({ exit: false }, () => {
        this.setState({ nodes: newProps.nodes, stagger: false });
      });
      return;
    }

    // Otherwise, transition out and in again
    this.props.scrollTop(0);

    this.setState({ exit: true }, () => {
      this.setState(
        { nodes: [], stagger: true },
        () => {
          if (this.refreshTimer) { clearTimeout(this.refreshTimer); }
          this.refreshTimer = setTimeout(
            () => this.setState({
              nodes: newProps.nodes,
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
      selected,
      onSelect,
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

    const isSource = !!find(nodes, ['uid', get(meta, 'uid', null)]);
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
                key={`${node.uid}`}
                index={index}
                stagger={stagger}
              >
                <EnhancedNode
                  color={nodeColor}
                  inactive={index !== 0}
                  label={`${label(node)}`}
                  selected={selected(node)}
                  onSelected={() => onSelect(node)}
                  meta={() => ({ ...node, itemType })}
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

OrdinalBinBucket.propTypes = {
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

OrdinalBinBucket.defaultProps = {
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
)(OrdinalBinBucket);
