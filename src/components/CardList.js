import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';
import { Icon } from '../ui/components';
import { nodePrimaryKeyProperty, getNodeAttributes } from '../ducks/modules/network';

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
    getKey,
  } = props;

  const classNames = cx('card-list', className);

  const nodeAttributes = node => getNodeAttributes(node);

  return (
    <div className={classNames}>
      {
        nodes.map(node => (
          <span className="card-list__content" key={getKey(node)}>
            <EnhancedCard
              label={label(nodeAttributes(node))}
              multiselect={multiselect}
              compact={compact}
              selected={selected(node)}
              details={details(nodeAttributes(node))}
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
  getKey: PropTypes.func,
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
  getKey: node => node[nodePrimaryKeyProperty],
};

export default compose(
  scrollable,
)(CardList);
