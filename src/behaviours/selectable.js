/* eslint-disable react/no-find-dom-node */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Touch from 'react-hammerjs';
import { findDOMNode } from 'react-dom';
import PreventGhostClick from '../utils/PreventGhostClick';

export default function selectable(WrappedComponent) {
  class Selectable extends Component {
    componentDidMount() {
      if (this.props.canSelect) {
        PreventGhostClick(findDOMNode(this.node));
      }
    }

    render() {
      if (!this.props.canSelect) { return <WrappedComponent {...this.props} />; }
      return (
        <Touch onTap={this.props.onSelected} ref={(node) => { this.node = node; }}>
          <WrappedComponent {...this.props} />
        </Touch>
      );
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
