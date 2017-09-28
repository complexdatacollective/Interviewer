/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

export default function selectable(WrappedComponent) {
  class Selectable extends Component {
    componentDidMount() {
      if (!this.props.canSelect) { return; }
      this.el = findDOMNode(this.node);
      this.el.addEventListener('click', this.onTap, { passive: true });
    }

    componentWillUnmount() {
      if (this.el) {
        this.el.removeEventListener('click', this.onTap);
      }
    }

    onTap = () => {
      this.props.onSelected();
    }

    render() {
      const {
        canSelect,
        onSelected,
        ...rest
      } = this.props;

      if (!canSelect) { return <WrappedComponent {...rest} />; }

      return <WrappedComponent {...rest} ref={(node) => { this.node = node; }} />;
    }
  }

  Selectable.propTypes = {
    onSelected: PropTypes.func,
    canSelect: PropTypes.bool,
  };

  Selectable.defaultProps = {
    onSelected: () => {},
    canSelect: true,
  };

  return Selectable;
}
