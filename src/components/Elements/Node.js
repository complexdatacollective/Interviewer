import React, { Component } from 'react';
import classNames from 'classnames';

class Node extends Component {
  render() {
    const {
      label,
      isActive,
    } = this.props;

    const classes = classNames('node', { 'node--is-active': isActive });

    return (
      <div className={ classes } >
        <div className="node__label">{ label }</div>
      </div>
    );
  }
}

Node.defaultProps = {
  label: 'Node',
};

export default Node;
