import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../ui/components';
import { CardList } from '.';
import { NodePrimaryKeyProperty, NodeAttributesProperty } from '../ducks/modules/network';
import sortOrder from '../utils/sortOrder';

class ListSelect extends Component {
  static getDerivedStateFromProps(nextProps) {
    const sorter = sortOrder(nextProps.initialSortOrder);
    const sortedNodes = sorter(nextProps.nodes);
    return {
      activeSortOrder: {
        ...nextProps.initialSortOrder[0],
      },
      nodes: sortedNodes,
    };
  }
  constructor(props) {
    super(props);

    this.state = {
      activeSortOrder: {
        ...this.props.initialSortOrder[0], // For now, just respect the first default sort rule
      },
      filterValue: '',
      nodes: this.props.nodes,
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
        // Node data model attributes are stored in a specific named property
        const nodeAttributes = node[NodeAttributesProperty] || {};

        // Lowercase for comparison
        const nodeLabel = this.props.label(nodeAttributes).toLowerCase();
        const filterValue = this.state.filterValue.toLowerCase();

        const nodeDetails = this.props.details(nodeAttributes);

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
  selected = node =>
    !!this.props.selectedNodes
      .find(current => current[NodePrimaryKeyProperty] === node[NodePrimaryKeyProperty]);

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
    const matchingPK = n => n[NodePrimaryKeyProperty] === node[NodePrimaryKeyProperty];
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
      sortFields,
    } = this.props;

    const sorter = sortOrder([this.state.activeSortOrder]);
    const nodes = sorter(this.state.nodes);

    return (
      <div className="list-select">
        <div className="list-select__sort">
          { sortFields && sortFields.map(sortField => (
            <Button
              color={this.state.activeSortOrder.property === sortField.variable ? 'primary' : 'white'}
              key={sortField.variable}
              onClick={() => this.setSortBy(sortField.variable)}
              size="small"
            >
              {(sortField.label || sortField.variable) + this.getDirection(sortField.variable)}
            </Button>
          ))}
          <input type="search" placeholder="Filter" onChange={this.onFilterChange} value={this.state.filterValue} />
        </div>
        <CardList
          details={details}
          label={label}
          nodes={nodes}
          onToggleCard={this.toggleCard}
          selected={this.selected}
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
