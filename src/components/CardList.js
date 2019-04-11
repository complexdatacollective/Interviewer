import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';
import { Icon } from '../ui/components';
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
    onDeleteCard,
    onToggleCard,
    selected,
    getKey,
  } = props;

  const classNames = cx('card-list', className);
  console.log('cardlist', props);
  return (
    <div className={classNames}>
      {
        nodes.map(node => (
          <span className="card-list__content" key={getKey(node)}>
            <EnhancedCard
              label={label(node)}
              selected={selected(node)}
              details={details(node)}
              onSelected={() => onToggleCard(node)}
            />
            {
              onDeleteCard &&
              <Icon className="card-list__delete-button" name="close" onClick={() => onDeleteCard(node)} />
            }
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
  onDeleteCard: PropTypes.func,
  onToggleCard: PropTypes.func,
  selected: PropTypes.func,
  getKey: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  nodes: [],
  onDeleteCard: null,
  onToggleCard: () => {},
  selected: () => false,
  getKey: node => node[entityPrimaryKeyProperty],
};

export default compose(
  scrollable,
)(CardList);
