import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedCard = selectable(Card);

/**
  * Card List
  */
const CardList = (props) => {
  const {
    className,
    details,
    label,
    nodes,
    onItemClick,
    isItemSelected,
    getKey,
  } = props;

  const classNames = cx('card-list', className);

  return (
    <div className={classNames}>
      {
        nodes.map(node => (
          <span className="card-list__content" key={getKey(node)}>
            <EnhancedCard
              label={label(node)}
              selected={isItemSelected(node)}
              details={details(node)}
              onSelected={() => onItemClick(node)}
            />
          </span>
        ))
      }
    </div>
  );
};

CardList.propTypes = {
  className: PropTypes.string,
  details: PropTypes.func,
  label: PropTypes.func,
  nodes: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  isItemSelected: PropTypes.func,
  getKey: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  nodes: [],
  onItemClick: () => {},
  isItemSelected: () => false,
  getKey: node => node[entityPrimaryKeyProperty],
};

export default compose(
  scrollable,
)(CardList);
