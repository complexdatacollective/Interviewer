import React from 'react';
import { compose, withProps } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';

/**
  * Renders a droppable CategoricalBin item
  */
const CategoricalItem = ({
  accentColor,
  isOver,
  label,
  onClick,
  willAccept,
}) => {
  const classNames = cx(
    'categorical-item',
    { 'categorical-item--hover': willAccept && isOver },
  );

  return (
    <div className={classNames} style={{ borderColor: accentColor }} onClick={onClick} >
      <div className="categorical-item--title">
        <h3>{label}</h3>
      </div>
    </div>
  );
};

CategoricalItem.propTypes = {
  accentColor: PropTypes.string,
  isOver: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  willAccept: PropTypes.bool,
};

CategoricalItem.defaultProps = {
  accentColor: 'black',
  isOver: false,
  label: 'undefined',
  onClick: () => {},
  willAccept: false,
};

export default compose(
  withProps(() => ({
    accepts: () => true,
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(CategoricalItem);
