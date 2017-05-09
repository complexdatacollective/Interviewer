import React, { Component } from 'react';
import Touch from 'react-hammerjs';

export default function selectable(WrappedComponent) {
  return class Selectable extends Component {

    render() {
      return (
        <Touch onTap={ this.props.onSelect }>
          <WrappedComponent { ...this.props } />
        </Touch>
      );
    }

  }
};
