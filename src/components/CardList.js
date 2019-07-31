import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { selectable } from '../behaviours';
import { Card } from '.';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

/* eslint-disable */
// [ ratio, columns ]
// First match (windowRatio > ratio) sets columns
const ratios = [
  [ 16/ 9, 4 ],
  [ 16/10, 3 ],
  [  4/ 3, 2 ],
];
/* eslint-enable */

const EnhancedCard = selectable(Card);

/**
  * Card List
  */
class CardList extends Component {
  constructor(props) {
    super(props);

    this.listRef = React.createRef();
    this.columns = 1;

    this.cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50,
    });
  }

  componentWillMount() {
    const windowRatio = window.innerWidth / window.innerHeight;

    const [, columns] = ratios.find(([ratio]) => windowRatio > ratio);

    this.columns = columns;
  }

  getColumns = () =>
    this.columns;

  getRows = () =>
    Math.ceil(this.props.items.length / this.getColumns());

  rowRenderer = ({
    parent,
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
  }) => {
    const {
      details,
      label,
      items,
      onItemClick,
      isItemSelected,
      getKey,
    } = this.props;

    const offset = index * this.getColumns();

    const nodes = items.slice(offset, offset + this.getColumns());

    const handleSelected = node =>
      () => {
        onItemClick(node);
        if (this.listRef.current) {
          // Ensure item changes are shown
          this.listRef.current.forceUpdateGrid();
        }
      };

    return (
      <CellMeasurer
        cache={this.cellCache}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        <div
          className="card-list__row"
          style={{ ...style, display: 'flex' }}
        >
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
      </CellMeasurer>
    );
  }

  render() {
    const {
      className,
    } = this.props;

    const classNames = cx('card-list', className);
    // const rowHeight = getCSSVariableAsNumber('--card-list-row-height');

    return (
      <div className={classNames}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={this.getRows()}
              deferredMeasurementCache={this.cellCache}
              rowHeight={this.cellCache.rowHeight}
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
