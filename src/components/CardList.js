import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';

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
    onToggleCard,
    selected,
    uid,
  } = props;

  const classNames = cx('card-list', className);

  return (
    <div className={classNames}>
      {
        nodes.map(node => (
          <span key={uid(node)}>
            <EnhancedCard
              label={label(node)}
              selected={selected(node)}
              details={details(node)}
              onSelected={() => onToggleCard(node)}
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
  onToggleCard: PropTypes.func,
  selected: PropTypes.func,
  uid: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  nodes: [],
  onToggleCard: () => {},
  selected: () => false,
  uid: node => node.uid,
};

export default compose(
  scrollable,
)(CardList);
