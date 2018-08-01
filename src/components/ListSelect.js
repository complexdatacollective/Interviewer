import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from '../ui/components';
import { CardList } from '.';
import { NodePK } from '../ducks/modules/network';

class ListSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ascending: this.props.initialSortDirection === 'asc',
      filterValue: '',
      property: this.props.initialSortOrder || this.props.labelKey,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initialSortOrder !== this.props.initialSortOrder) {
      this.setState({
        property: nextProps.initialSortOrder,
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
    if (property === this.state.property) {
      return this.state.ascending ? ' \u25B2' : ' \u25BC';
    }
    return '';
  };

  /**
    * @return sorted list
    */
  getSortedList = () =>
    this.props.nodes.sort(this.compare(this.state.property, this.state.ascending));

  /**
    * @return filtered list
    */
  getFilteredList = list => list.filter(node => (
    this.props.label(node) && this.props.details(node) &&
    (this.props.label(node).toLowerCase().includes(this.state.filterValue.toLowerCase()) ||
    this.props.details(node).some(detail => Object.values(detail).some(
      item => item.toLowerCase().includes(this.state.filterValue.toLowerCase()),
    )))
  ));

  /**
    * @param property to sort by
    */
  setSortBy = (property) => {
    if (this.state.property === property) {
      this.toggleSortDirection();
    } else {
      this.setState({
        ascending: true,
        property,
      });
    }
  };

  /**
    * @param {object} node
    */
  selected = node => !!this.props.selectedNodes.find(current => current[NodePK] === node[NodePK]);

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
    const matchingPK = n => n[NodePK] === node[NodePK];
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

    return (
      <div className="list-select">
        <div className="list-select__sort">
          { sortFields && sortFields.map(sortField => (
            <Button
              color={this.state.property === sortField.variable ? 'primary' : 'white'}
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
          nodes={this.getFilteredList(this.getSortedList())}
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
