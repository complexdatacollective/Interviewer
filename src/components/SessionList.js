import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { scrollable, selectable } from '../behaviours';
import { SessionCard } from '.';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import {
  DragSource,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';

const EnhancedSessionCard = DragSource(selectable(SessionCard));

/**
  * SessionCard List
  */
const SessionList = (props) => {
  const {
    className,
    details,
    label,
    items,
    onItemClick,
    onDeleteCard,
    isItemSelected,
    getKey,
  } = props;

  const classNames = cx('session-list', className);

  return (
    <div className={classNames}>
      {
        items.map(node => (
          <span className="session-list__content" key={getKey(node)}>
            <EnhancedSessionCard
              {...this.props}
              label={label(node)}
              selected={isItemSelected(node)}
              details={details(node)}
              meta={() => ({ uuid: node.uuid })}
              onSelected={() => onItemClick(node)}
              onDeleteCard={() => onDeleteCard(node)}
            />
          </span>
        ))
      }
    </div>
  );
};

SessionList.propTypes = {
  className: PropTypes.string,
  details: PropTypes.func,
  label: PropTypes.func,
  items: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  onDeleteCard: PropTypes.func,
  isItemSelected: PropTypes.func,
  getKey: PropTypes.func,
};

SessionList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  items: [],
  onItemClick: () => {},
  onDeleteCard: () => {},
  isItemSelected: () => false,
  itemType: 'SESSION',
  isDragging: false,
  meta: {},
  getKey: node => node[entityPrimaryKeyProperty],
};

export default compose(
  MonitorDragSource(['meta', 'isDragging']),
  scrollable,
)(SessionList);
