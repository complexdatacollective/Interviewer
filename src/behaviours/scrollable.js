import React, { Component } from 'react';

const scrollable = WrappedComponent =>
  class Scrollable extends Component {
    render() {
      return (
        <div className="scrollable">
          <WrappedComponent {...this.props} scrollTop={this.scrollTop} />
        </div>
      );
    }
  };

export default scrollable;
