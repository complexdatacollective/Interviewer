import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { scrollable, selectable } from '../behaviours';
import { Card } from '.';

const EnhancedCard = selectable(Card);

/**
  * Card List
  */
const CardList = (props) => {
  const {
    details,
    label,
    nodes,
    onToggleCard,
    selected,
  } = props;

  return (
    <div className="card-list">
      {
        nodes.map(node => (
          <span key={node.uid}>
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
  details: PropTypes.func,
  label: PropTypes.func,
  nodes: PropTypes.array.isRequired,
  onToggleCard: PropTypes.func,
  selected: PropTypes.func,
};

CardList.defaultProps = {
  details: () => (''),
  label: () => (''),
  nodes: [],
  onToggleCard: () => {},
  selected: () => false,
};

export default compose(
  scrollable,
)(CardList);
