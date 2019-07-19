import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { chunk } from 'lodash';
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

  getCols = () => {
    return 3;
  }

  getRows = () => {
    return Math.ceil(this.props.items.length / this.getCols());
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

    const cols = this.getCols();

    const offset = index * cols;

    const nodes = items.slice(offset, offset + cols);

    const handleSelected = node =>
      () => {
        onItemClick(node);
        if (this.listRef.current) { this.listRef.current.forceUpdate(); }
      };

    return (
      <div style={{ ...style, display: 'flex' }} key={index}>
        {nodes.map(node => (
          <span
            className="card-list__content"
            key={getKey(node)}
          >
            <EnhancedCard
              label={label(node)}
              selected={isItemSelected(node)}
              details={details(node)}
              onSelected={handleSelected(node)}
            />
          </span>
        ))}
      </div>
    );
  }

  render() {
    const {
      className,
      items,
    } = this.props;

    console.log({ items: items.length, rows: this.getRows() });

    const classNames = cx('card-list', className);

    return (
      <div className={classNames}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={this.getRows()}
              rowHeight={120}
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
