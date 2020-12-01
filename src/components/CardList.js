import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { times } from 'lodash';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
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

  getRow = (index) => {
    const items = this.props.items;
    const columns = this.getColumns();

    const offset = index * columns;

    const nodes = items.slice(offset, offset + columns);
    const spaces = times(columns - nodes.length, () => null);

    return [...nodes, ...spaces];
  };

  rowRenderer = ({
    parent,
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
  }) => {
    const {
      details,
      label,
      onItemClick,
      isItemSelected,
      getKey,
    } = this.props;

    const nodes = this.getRow(index);

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
          {nodes.map((node, column) => {
            if (!node) { return <span className="card-list__content" key={`column-space-${column}`} />; }

            return (
              <span
                className="card-list__content"
                key={getKey(node)}
              >
                <Card
                  label={label(node)}
                  selected={isItemSelected(node)}
                  details={details(node)}
                  onSelected={handleSelected(node)}
                />
              </span>
            );
          })}
        </div>
      </CellMeasurer>
    );
  }

  render() {
    const {
      className,
      items,
      // we don't want the following props polluting `rest` which is used to indicate
      // prop changes like `sortBy`
      dispatch,
      details,
      label,
      onItemClick,
      isItemSelected,
      getKey,
      ...rest
    } = this.props;

    const cardlistClasses = cx('card-list', className);

    return (
      <div className={cardlistClasses}>
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
              items={items}
              className="scrollable"
              {...rest}
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
