import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { find, get } from 'lodash';
import cx from 'classnames';
import { Node, animation } from 'network-canvas-ui';
import { scrollable, selectable } from '../behaviours';
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
const NodeList = ({
  nodes,
  nodeColor,
  label,
  selected,
  onSelect,
  itemType,
  isOver,
  willAccept,
  meta,
}) => {
  const isSource = !!find(nodes, ['uid', get(meta, 'uid', null)]);

  const classNames = cx(
    'node-list',
    { 'node-list--hover': !isSource && willAccept && isOver },
    { 'node-list--drag': !isSource && willAccept }, // TODO: rename class
  );

  return (
    <div
      className={classNames}
    >
      { isOver && willAccept &&
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
              meta={() => ({ ...node, itemType })}
              {...node}
            />
          </span>
        ))
      }
    </div>
  );
};

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
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(NodeList);
