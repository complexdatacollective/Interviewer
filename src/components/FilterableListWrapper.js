import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
import { Text } from '@codaco/ui/lib/components/Fields';
import { entityAttributesProperty } from '@codaco/shared-consts';
import createSorter from '../utils/createSorter';

class FilterableListWrapper extends Component {
  constructor(props) {
    super(props);

    const { initialSortOrder } = this.props;

    this.state = {
      activeSortOrder: {
        ...initialSortOrder[0], // For now, just respect the first default sort rule
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
    const { activeSortOrder } = this.state;
    if (property === activeSortOrder.property) {
      return activeSortOrder.direction === 'asc' ? ' \u25B2' : ' \u25BC';
    }
    return '';
  };

  /**
    * @return filtered list
    * This filter works by testing if the filterValue is present in either the any of node
    * node attributes.
    *
    * TODO: specify search attributes, include fuzziness, match start of string only.
    */
  getFilteredList = (list) => {
    const { filterValue } = this.state;
    const lowerCaseFilterValue = filterValue.toLowerCase();
    if (!lowerCaseFilterValue) { return list; }

    const filteredList = list.filter(
      (node) => {
        const nodeDetails = Object.values(node[entityAttributesProperty]);
        // Include in filtered list if any of the attribute property values
        // include the filter value
        return nodeDetails.some(
          (item) => item && item.toString().toLowerCase().includes(lowerCaseFilterValue),
        );
      },
    );

    return filteredList;
  }

  /**
    * @param property to sort by
    */
  setSortBy = (property) => {
    const { activeSortOrder } = this.state;
    if (activeSortOrder.property === property) {
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
    * changes direction of current sort
    */
  toggleSortDirection = () => {
    const { activeSortOrder } = this.state;
    this.setState({
      activeSortOrder: {
        direction: activeSortOrder.direction === 'asc' ? 'desc' : 'asc',
        property: activeSortOrder.property,
      },
    });
  };

  render() {
    const {
      sortFields,
      ListComponent,
      listComponentProps,
      items,
    } = this.props;
    const {
      activeSortOrder,
      filterValue,
    } = this.state;

    const sorter = createSorter([activeSortOrder]);
    const sortedNodes = this.getFilteredList(sorter(items));

    return (
      <div className="list-select">
        <div className="list-select__sort">
          <div>
            {(sortFields && sortFields.length > 0)
              && (
                <>
                  <h4>Sort: </h4>
                  {sortFields.map((sortField) => (
                    <Button
                      color={activeSortOrder.property === sortField.variable ? 'primary' : 'white'}
                      key={sortField.variable}
                      onClick={() => this.setSortBy(sortField.variable)}
                    >
                      {
                        (sortField.label || sortField.variable)
                        + this.getDirection(sortField.variable)
                      }
                    </Button>
                  ))}
                </>
              )}
          </div>
          <div>
            <h4>Filter: </h4>
            <Text
              type="search"
              placeholder="Filter Items..."
              className="list-select__filter"
              input={{
                value: filterValue,
                onChange: this.onFilterChange,
              }}
            />
          </div>
        </div>
        <ListComponent
          {...listComponentProps}
          sortDirection={activeSortOrder.direction}
          sortProperty={activeSortOrder.property}
          filter={filterValue}
          items={sortedNodes}
        />
      </div>
    );
  }
}

FilterableListWrapper.propTypes = {
  initialSortOrder: PropTypes.array,
  items: PropTypes.array.isRequired,
  allowFiltering: PropTypes.bool,
  sortFields: PropTypes.array,
  ListComponent: PropTypes.func.isRequired,
  listComponentProps: PropTypes.shape({
  }).isRequired,
};

FilterableListWrapper.defaultProps = {
  initialSortOrder: [{
    property: '',
    direction: 'asc',
  }],
  allowFiltering: true,
  sortFields: [],
};

export default FilterableListWrapper;
