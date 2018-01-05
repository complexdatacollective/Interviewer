import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button } from 'network-canvas-ui';
import { CardList, Modal } from '.';

class ListSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
    * @param {object} node
    */
  selected = node => !!this.state.selected.find(current => current.uid === node.uid);

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
      name,
      nodes,
    } = this.props;

    return (
      <Modal name={name} title="Add some nodes">
        <CardList
          details={details}
          label={label}
          nodes={nodes}
          onToggleCard={this.toggleCard}
          selected={this.selected}
        />
        <Button onClick={this.onSubmit}>Add Nodes</Button>
      </Modal>
    );
  }
}

ListSelect.propTypes = {
  details: PropTypes.func,
  label: PropTypes.func,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.symbol,
  ]).isRequired,
  nodes: PropTypes.array.isRequired,
  onSubmit: PropTypes.func,
};

ListSelect.defaultProps = {
  details: () => (''),
  label: () => (''),
  nodes: [],
  onSubmit: () => {},
};

export default ListSelect;
