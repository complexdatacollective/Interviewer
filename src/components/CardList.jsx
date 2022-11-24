import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { times } from 'lodash';
import {
  List, AutoSizer, CellMeasurer, CellMeasurerCache,
} from 'react-virtualized';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import Card from './Card';

const calculateRequiredColumns = (width, height) => {
  // Tuple in format of [ratio, noOfColumns]
  const ratios = [
    [16 / 9, 4],
    [16 / 10, 3],
    [4 / 3, 2],
  ];

  const windowRatio = width / height;

  // Calculate appropriate col number by finding closest ratio, or defaulting to 1
  const [, columns] = ratios.find(([ratio]) => windowRatio >= ratio) || [0, 1];

  return columns;
};

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

  // TODO: Make this component functional?
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.columns = calculateRequiredColumns(window.innerWidth, window.innerHeight);
  }

  getColumns = () => this.columns;

  getRows = () => {
    const { items } = this.props;
    return Math.ceil(items.length / this.getColumns());
  };

  getRow = (index) => {
    const { items } = this.props;
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

    const handleSelected = (node) => () => {
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
  items: PropTypes.array,
  onItemClick: PropTypes.func,
  isItemSelected: PropTypes.func,
  getKey: PropTypes.func,
};

CardList.defaultProps = {
  className: '',
  details: () => (''),
  label: () => (''),
  items: [],
  onItemClick: () => { },
  isItemSelected: () => false,
  getKey: (node) => node[entityPrimaryKeyProperty],
};

export default CardList;
