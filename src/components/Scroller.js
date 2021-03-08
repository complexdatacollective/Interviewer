import React, { Component } from 'react';
import { Scroller as UIScroller } from '@codaco/ui/lib/components';
import PropTypes from 'prop-types';

class Scroller extends Component {
  constructor(props) {
    super(props);

    this.scrollable = props.forwardedRef || React.createRef();
  }

  handleScroll = () => {
    if (!this.scrollable.current) { return; }
    const element = this.scrollable.current;
    const { scrollTop } = element;
    const maxScrollPosition = element.scrollHeight - element.clientHeight;
    const scrollAmount = scrollTop / maxScrollPosition;

    this.props.onScroll(scrollTop, scrollAmount);
  }

  render() {
    const {
      className,
      children,
      useSmoothScrolling,
    } = this.props;

    return (
      <UIScroller
        className={className}
        onScroll={this.handleScroll}
        useSmoothScrolling={useSmoothScrolling}
        forwardedRef={this.scrollable}
      >
        {children}
      </UIScroller>
    );
  }
}

Scroller.defaultProps = {
  className: '',
  onScroll: () => {},
  useSmoothScrolling: true,
};

Scroller.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
  onScroll: PropTypes.func,
  useSmoothScrolling: PropTypes.bool,
};

export default Scroller;
