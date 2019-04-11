import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import Scroller from './Scroller';
import { Button } from '../ui/components';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';
import { selectable } from '../behaviours';
import {
  DragSource,
  DropTarget,
  MonitorDropTarget,
  MonitorDragSource,
} from '../behaviours/DragAndDrop';

class NewListSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSortOrder: {
        ...this.props.initialSortOrder[0], // For now, just respect the first default sort rule
      },
      filterValue: '',
    };
  }

  /**
    *
    */
  onFilterChange = (event) => {
    this.setState({
      filterValue: event.target.value,
    });
  };

  /**
    * @param {string} current property
    * @return character to indicate sort direction (if applicable)
    */
  getDirection = (property) => {
    if (property === this.state.activeSortOrder.property) {
      return this.state.activeSortOrder.direction === 'asc' ? ' \u25B2' : ' \u25BC';
    }
    return '';
  };

  /**
    * @return filtered list
    * This filter works by testing if the filterValue is present in either:
    *  - The node label
    *  - Or one of the details passed to the node
    *
    * TODO: Expand filtering to look at all node properties, not just ones passed as card details.
    */
  getFilteredList = (list) => {
    const filteredList = list.filter(
      (node) => {
        // Lowercase for comparison
        const nodeLabel = (this.props.label(node) || '').toLowerCase();
        const filterValue = this.state.filterValue.toLowerCase();

        const nodeDetails = this.props.details(node);

        // Include in filtered list if:
        // - The label includes the filter value, OR
        // - Any of the detail property values include the filter value
        return (
          nodeLabel.includes(filterValue) ||
          nodeDetails.some((detail) => {
            const detailProperties = Object.values(detail);

            return detailProperties.some(
              item => item.toString().toLowerCase().includes(filterValue),
            );
          })
        );
      },
    );

    return filteredList;
  }

  /**
    * @param property to sort by
    */
  setSortBy = (property) => {
    if (this.state.activeSortOrder.property === property) {
      this.toggleSortDirection();
    } else {
      this.setState({
        activeSortOrder: {
          property,
          direction: 'asc',
        },
      });
    }
  };

  /**
    * @param {object} node
    */
  isNodeSelected = node =>
    !!this.props.selectedNodes
      .find(current => current[entityPrimaryKeyProperty] === node[entityPrimaryKeyProperty]);

  /**
    * changes direction of current sort
    */
  toggleSortDirection = () => {
    this.setState({
      activeSortOrder: {
        direction: this.state.activeSortOrder.direction === 'asc' ? 'desc' : 'asc',
        property: this.state.activeSortOrder.property,
      },
    });
  };

  /**
    * toggle whether the card is selected or not.
    * @param {object} node
    */
  toggleCard = (node) => {
    const matchingPK = n => n[entityPrimaryKeyProperty] === node[entityPrimaryKeyProperty];
    const index = this.props.selectedNodes.findIndex(matchingPK);
    if (index !== -1) {
      this.props.onRemoveNode(this.props.items.find(matchingPK));
    } else {
      this.props.onSubmitNode(this.props.items.find(matchingPK));
    }
  };

  render() {
    const {
      items,
      sortFields,
      itemComponent,
      onItemClick,
      itemProperties,
    } = this.props;

    const EnhancedItem = DragSource(selectable(itemComponent));

    const sorter = sortOrder([this.state.activeSortOrder]);
    const sortedItems = sorter(items);

    const classNames = cx('card-list');

    console.log(this.props);
    return (
      <div className="list-select">
        <div className="list-select__sort">
          { sortFields && sortFields.map(sortField => (
            <Button
              color={this.state.activeSortOrder.property === sortField.variable ? 'primary' : 'white'}
              key={sortField.variable}
              onClick={() => this.setSortBy(sortField.variable)}
            >
              {(sortField.label || sortField.variable) + this.getDirection(sortField.variable)}
            </Button>
          ))}
          <input
            className="list-select__filter"
            type="search"
            placeholder="Filter"
            onChange={this.onFilterChange}
            value={this.state.filterValue}
          />
        </div>
        <Scroller className={classNames}>
          {
            sortedItems.map(item => (
              <span className="card-list__content">
                <EnhancedItem
                  onClick={self => onItemClick(self)}
                  {...item}
                  {...itemProperties}
                />
              </span>
            ))
          }
        </Scroller>
      </div>
    );
  }
}

NewListSelect.propTypes = {
  initialSortOrder: PropTypes.array,
  items: PropTypes.array.isRequired,
  onItemClick: PropTypes.func,
  sortFields: PropTypes.array,
  itemComponent: PropTypes.func.isRequired,
  itemProperties: PropTypes.object,
};

NewListSelect.defaultProps = {
  initialSortOrder: [{
    property: '*',
    direction: 'asc',
  }],
  sortFields: [],
  onItemClick: () => {},
  itemProperties: {},
};

export default compose(
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
  MonitorDragSource(['meta', 'isDragging']),
)(NewListSelect);
