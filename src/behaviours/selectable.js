import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

export default function selectable(WrappedComponent) {
  class Selectable extends Component {
    constructor(props) {
      super(props);

      this.state = {
        time: 0,
      };

      this.onTap = debounce(this.onTap.bind(this), 200);
    }

    onTap() {
      this.props.onSelected();
    }

    onTouchStart = () => {
      this.setState({ time: new Date().getTime() });
    }

    onTouchEnd = () => {
      const time = new Date().getTime();

      if (time - this.state.time < 100) {
        this.onTap();
      }
    }

    render() {
      const {
        canSelect,
        onSelected,
        ...rest
      } = this.props;

      if (!canSelect) { return <WrappedComponent {...rest} />; }

      return (
        <span
          onClick={this.onTap}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
        >
          <WrappedComponent {...rest} />
        </span>
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
