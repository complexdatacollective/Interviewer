import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'network-canvas-ui';
import { CardList, Modal } from '.';

class ListSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ascending: true,
      filterValue: '',
      property: this.props.labelKey,
      selected: [],
    };
  }

  /**
    * submit all selected nodes
    */
  onSubmit = () => {
    this.props.onSubmit(this.state.selected);
    this.setState({ selected: [] });
  };

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
    this.props.label(node).toLowerCase().includes(this.state.filterValue.toLowerCase()) ||
    this.props.details(node).some(detail => Object.values(detail).some(
      item => item.toLowerCase().includes(this.state.filterValue.toLowerCase()),
    ))
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
  selected = node => !!this.state.selected.find(current => current.uid === node.uid);

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
    const index = this.state.selected.findIndex(current => current.uid === node.uid);
    if (index !== -1) {
      this.setState({
        selected: this.state.selected.filter((ele, i) => index !== i),
      });
    } else {
      this.setState({
        selected: this.state.selected.concat(node),
      });
    }
  };

  render() {
    const {
      details,
      label,
      labelKey,
      name,
      title,
    } = this.props;

    return (
      <Modal name={name} title={title} className="modal--fullscreen">
        <div className="list-select">
          <div className="list-select__sort">
            <Button
              color={this.state.property === labelKey ? 'primary' : 'white'}
              onClick={() => this.setSortBy(labelKey)}
              size="small"
            >
              {labelKey + this.getDirection(labelKey)}
            </Button>
            {
              details({}).map(detail => (
                <Button
                  color={this.state.property === Object.keys(detail)[0] ? 'primary' : 'white'}
                  key={Object.keys(detail)[0]}
                  onClick={() => this.setSortBy(Object.keys(detail)[0])}
                  size="small"
                >
                  {Object.keys(detail)[0] + this.getDirection(Object.keys(detail)[0])}
                </Button>
              ))
            }
            <input type="search" placeholder="Filter" onChange={this.onFilterChange} value={this.state.filterValue} />
          </div>
          <CardList
            details={details}
            label={label}
            nodes={this.getFilteredList(this.getSortedList())}
            onToggleCard={this.toggleCard}
            selected={this.selected}
          />
          <Button className="button list-select__submit" onClick={this.onSubmit}>Add Nodes</Button>
        </div>
      </Modal>
    );
  }
}

ListSelect.propTypes = {
  details: PropTypes.func,
  label: PropTypes.func,
  labelKey: PropTypes.string,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  nodes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
};

ListSelect.defaultProps = {
  details: () => (''),
  label: () => (''),
  labelKey: '',
  nodes: [],
  onSubmit: () => {},
  title: 'Add a Node',
};

export default ListSelect;
