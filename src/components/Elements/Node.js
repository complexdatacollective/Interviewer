import React, { Component } from 'react';

class Node extends Component {
  render() {
    const {
      label,
      className,
      isSelected,
      ...other,
    } = this.props;

    return (
      <div className={ 'node ' + (isSelected ? ' node--is-selected ' : '') + className } { ...other } >
        <h3>{ label }</h3>
      </div>
    );
  }
}

Node.defaultProps = {
  label: 'Node',
  className: '',
};

export default Node;
