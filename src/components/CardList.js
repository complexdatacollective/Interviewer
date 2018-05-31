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
    compact,
    details,
    label,
    multiselect,
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
              multiselect={multiselect}
              compact={compact}
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
  compact: PropTypes.bool,
  details: PropTypes.func,
  label: PropTypes.func,
  multiselect: PropTypes.bool,
  nodes: PropTypes.array.isRequired,
  onToggleCard: PropTypes.func,
  selected: PropTypes.func,
  uid: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  compact: false,
  details: () => (''),
  label: () => (''),
  multiselect: true,
  nodes: [],
  onToggleCard: () => {},
  selected: () => false,
  uid: node => node.uid,
};

export default compose(
  scrollable,
)(CardList);
