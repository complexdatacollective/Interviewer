import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { List, AutoSizer } from 'react-virtualized';
import { scrollable, selectable } from '../behaviours';
import { Card } from '.';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

const EnhancedCard = selectable(Card);

/**
  * Card List
  */
class CardList extends Component {
  constructor(props) {
    super(props);

    this.listRef = React.createRef();
  }

  rowRenderer = ({
    key,         // Unique key within array of rows
    index,       // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible,   // This row is visible within the List (eg it is not an overscanned row)
    style        // Style object to be applied to row (to position it)
  }) => {
    const {
      className,
      details,
      label,
      items,
      onItemClick,
      isItemSelected,
      getKey,
    } = this.props;

    const node = items[index];

    const handleSelected = () => {
      onItemClick(node);
      if (this.listRef.current) { this.listRef.current.forceUpdate(); }
    };

    return (
      <span
        className="card-list__content"
        key={getKey(node)}
        style={style}
      >
        <EnhancedCard
          label={label(node)}
          selected={isItemSelected(node)}
          details={details(node)}
          onSelected={handleSelected}
        />
      </span>
    );
  }

  render() {
    const {
      className,
      items,
    } = this.props;

    const classNames = cx('card-list', className);

    return (
      <div className={classNames}>
        {/* {
          items.map(node => (
            <span className="card-list__content" key={getKey(node)}>
              <EnhancedCard
                label={label(node)}
                selected={isItemSelected(node)}
                details={details(node)}
                onSelected={() => onItemClick(node)}
              />
            </span>
          ))
        } */}
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={items.length}
              rowHeight={150}
              rowRenderer={this.rowRenderer}
              ref={this.listRef}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

CardList.propTypes = {
  className: PropTypes.string,
  details: PropTypes.func,
  label: PropTypes.func,
  items: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  isItemSelected: PropTypes.func,
  getKey: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  items: [],
  onItemClick: () => {},
  isItemSelected: () => false,
  getKey: node => node[entityPrimaryKeyProperty],
};

export default CardList;
