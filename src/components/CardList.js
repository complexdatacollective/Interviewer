import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';
import { Icon } from '../ui/components';
import { NodePK } from '../ducks/modules/network';

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
    onDeleteCard,
    onToggleCard,
    selected,
    uid,
  } = props;

  const classNames = cx('card-list', className);

  return (
    <div className={classNames}>
      {
        nodes.map(node => (
          <span className="card-list__content" key={uid(node)}>
            <EnhancedCard
              label={label(node)}
              multiselect={multiselect}
              compact={compact}
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
  compact: PropTypes.bool,
  details: PropTypes.func,
  label: PropTypes.func,
  multiselect: PropTypes.bool,
  nodes: PropTypes.array.isRequired,
  onDeleteCard: PropTypes.func,
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
  onDeleteCard: null,
  onToggleCard: () => {},
  selected: () => false,
  // FIXME: no longer needed once externalData sorted; see Search.
  uid: node => node[NodePK],
};

export default compose(
  scrollable,
)(CardList);
