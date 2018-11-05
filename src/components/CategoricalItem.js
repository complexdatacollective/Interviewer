import React from 'react';
import { compose, withProps } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';
import { NodeList } from './';

/**
  * Renders a droppable CategoricalBin item
  */
const CategoricalItem = ({
  accentColor,
  details,
  isExpanded,
  isOver,
  label,
  nodes,
  onClick,
  sortOrder,
  willAccept,
}) => {
  const classNames = cx(
    'categorical-item',
    { 'categorical-item--hover': willAccept && isOver },
    { 'categorical-item--expanded': isExpanded },
  );

  return (
    <div className={classNames} style={{ borderColor: accentColor }} onClick={onClick} >
      <div className="categorical-item__title">
        <h3>{label}</h3>
        {!isExpanded && <h5>{details}</h5>}
      </div>
      {isExpanded &&
        <div className="categorical-item__content">
          <NodeList
            listId={`CATBIN_NODE_LIST_${label}`}
            id={`CATBIN_NODE_LIST_${label}`}
            nodes={nodes}
            sortOrder={sortOrder}
          />
        </div>
      }
    </div>
  );
};

CategoricalItem.propTypes = {
  accentColor: PropTypes.string,
  details: PropTypes.string,
  isExpanded: PropTypes.bool,
  isOver: PropTypes.bool,
  label: PropTypes.string,
  nodes: PropTypes.array,
  onClick: PropTypes.func,
  sortOrder: PropTypes.array,
  willAccept: PropTypes.bool,
};

CategoricalItem.defaultProps = {
  accentColor: 'black',
  details: 'empty',
  isExpanded: false,
  isOver: false,
  label: 'undefined',
  nodes: [],
  onClick: () => {},
  sortOrder: [],
  willAccept: false,
};

export default compose(
  withProps(() => ({
    accepts: () => true,
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(CategoricalItem);
