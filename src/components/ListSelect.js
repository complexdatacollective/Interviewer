import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../ui/components';
import { CardList } from '.';
import { NodePrimaryKeyProperty, NodeAttributesProperty } from '../ducks/modules/network';

class ListSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ascending: this.props.initialSortDirection === 'asc',
      filterValue: '',
      filterProperty: this.props.initialSortOrder || this.props.labelKey,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initialSortOrder !== this.props.initialSortOrder) {
      this.setState({
        filterProperty: nextProps.initialSortOrder,
      });
    }
    if (nextProps.initialSortDirection !== this.props.initialSortDirection) {
      this.setState({
        ascending: nextProps.initialSortDirection === 'asc',
      });
    }
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
    if (property === this.state.filterProperty) {
      return this.state.ascending ? ' \u25B2' : ' \u25BC';
    }
    return '';
  };

  /**
    * @return sorted list
    */
  getSortedList = () =>
    this.props.nodes.sort(this.compare(this.state.filterProperty, this.state.ascending));

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
        // Node attributes are stored in a specific named property
        const nodeAttributes = node[NodeAttributesProperty] || {};

        // Lowercase for comparison
        const nodeLabel = this.props.label(nodeAttributes).toLowerCase();
        const filterValue = this.state.filterValue.toLowerCase();

        const nodeDetails = this.props.details(nodeAttributes);

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
    if (this.state.filterProperty === property) {
      this.toggleSortDirection();
    } else {
      this.setState({
        ascending: true,
        filterProperty: property,
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
    * @param property to sort by
    * @param {boolean} ascending
    */
  compare = (property, ascending = true) => {
    let sortOrder = 1;
    if (!ascending) {
      sortOrder = -1;
    }

    return (a, b) => {
      if (!Object.hasOwnProperty.call(a, property) || !Object.hasOwnProperty.call(b, property)) {
        return 0;
      }

      let result = 0;

      const varA = (typeof a[property] === 'string') ?
        a[property].toUpperCase() : a[property];
      const varB = (typeof b[property] === 'string') ?
        b[property].toUpperCase() : b[property];

      if (varA < varB) {
        result = -1;
      } else if (varA > varB) {
        result = 1;
      }
      return result * sortOrder;
    };
  };

  /**
    * changes direction of current sort
    */
  toggleSortDirection = () => {
    this.setState({
      ascending: !this.state.ascending,
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

    const nodes = this.getFilteredList(this.getSortedList());

    return (
      <div className="list-select">
        <div className="list-select__sort">
          { sortFields && sortFields.map(sortField => (
            <Button
              color={this.state.filterProperty === sortField.variable ? 'primary' : 'white'}
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
  initialSortOrder: PropTypes.string,
  initialSortDirection: PropTypes.string,
  label: PropTypes.func,
  labelKey: PropTypes.string,
  nodes: PropTypes.array.isRequired,
  onRemoveNode: PropTypes.func,
  onSubmitNode: PropTypes.func,
  selectedNodes: PropTypes.array,
  sortFields: PropTypes.array,
};

ListSelect.defaultProps = {
  details: () => {},
  initialSortOrder: '',
  initialSortDirection: '',
  label: () => {},
  labelKey: '',
  nodes: [],
  onRemoveNode: () => {},
  onSubmitNode: () => {},
  selectedNodes: [],
  sortFields: [],
};

export default ListSelect;
