/* eslint-disable */

import React from 'react';
import { compose } from 'redux';
import { setDisplayName } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Node, animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../../utils/StaggeredTransitionGroup';
import { scrollable, selectable } from '../../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../../behaviours/DragAndDrop';

const EnhancedNode = DragSource(selectable(Node));

/**
  * Renders a list of Node.
  */
const NodeList = ({
  nodes,
  nodeColor,
  label,
  selected,
  onSelect,
  itemType,
  isOver,
  canAccept,
  isDragging,
}) => {
  const classNames = cx(
    'node-list',
    { 'node-list--hover': canAccept && isOver},
    { 'node-list--drag': canAccept }, // TODO: rename class
  );

  return (
    <StaggeredTransitionGroup
      className={classNames}
      component="div"
      delay={animation.duration.fast * 0.2}
      duration={animation.duration.slow}
      start={animation.duration.slow + 3}
      transitionName="node-list--transition"
      transitionLeave={false}
    >
      { isOver && canAccept &&
        <Node key="placeholder" placeholder />
      }
      {
        nodes.map(node => (
          <span key={node.uid}>
            <EnhancedNode
              color={nodeColor}
              label={label(node)}
              selected={selected(node)}
              onSelected={() => onSelect(node)}
              itemType={itemType}
              meta={() => node}
              {...node}
            />
          </span>
        ))
      }
    </StaggeredTransitionGroup>
  );
};

NodeList.propTypes = {
  nodes: PropTypes.array.isRequired,
  nodeColor: PropTypes.string,
  onSelectNode: PropTypes.func,
  label: PropTypes.func,
  selected: PropTypes.func,
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
  canAccept: false,
  isDragging: false,
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'canAccept']),
  scrollable,
)(NodeList);
