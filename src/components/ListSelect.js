import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../ui/components';
import { CardList } from '.';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';

class ListSelect extends Component {
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
              item => item.toLowerCase().includes(filterValue),
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
      .find(current => current[nodePrimaryKeyProperty] === node[nodePrimaryKeyProperty]);

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
    const matchingPK = n => n[nodePrimaryKeyProperty] === node[nodePrimaryKeyProperty];
    const index = this.props.selectedNodes.findIndex(matchingPK);
    if (index !== -1) {
      this.props.onRemoveNode(this.props.nodes.find(matchingPK));
    } else {
      this.props.onSubmitNode(this.props.nodes.find(matchingPK));
    }
  };

  render() {
    const {
      details,
      label,
      nodes,
      sortFields,
    } = this.props;

    const sorter = sortOrder([this.state.activeSortOrder]);
    const sortedNodes = sorter(nodes);

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
          <input type="search" placeholder="Filter" onChange={this.onFilterChange} value={this.state.filterValue} />
        </div>
        <CardList
          details={details}
          label={label}
          nodes={this.getFilteredList(sortedNodes)}
          onToggleCard={this.toggleCard}
          selected={this.isNodeSelected}
        />
      </div>
    );
  }
}

ListSelect.propTypes = {
  details: PropTypes.func,
  initialSortOrder: PropTypes.array,
  label: PropTypes.func,
  nodes: PropTypes.array.isRequired,
  onRemoveNode: PropTypes.func,
  onSubmitNode: PropTypes.func,
  selectedNodes: PropTypes.array,
  sortFields: PropTypes.array,
};

ListSelect.defaultProps = {
  details: () => {},
  initialSortOrder: [{
    property: '',
    direction: 'asc',
  }],
  label: () => {},
  nodes: [],
  onRemoveNode: () => {},
  onSubmitNode: () => {},
  selectedNodes: [],
  sortFields: [],
};

export default ListSelect;
