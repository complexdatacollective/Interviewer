import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

class Scrollable extends Component {

  constructor() {
    super();

    this.state = { isScrolling: false };
  }

  componentWillUnmount() {
    this.el.removeEventListener('scroll', this.updateScrollState);
  }

  componentDidMount() {
    this.el = ReactDOM.findDOMNode(this).querySelector('[data-scrollable-window]');
    this.el.addEventListener('scroll', this.updateScrollState);
  }

  updateScrollState = () => {
    const isScrolling = this.el.scrollTop > 0 ? true : false;

    this.setState({
      isScrolling: isScrolling,
    })
  }

  render() {
    const {
      children,
    } = this.props;

    const classes = classNames('scrollable', { 'scrollable--is-scrolling': this.state.isScrolling });

    return (
      <div className={ classes }>
        <div className="scrollable__window" data-scrollable-window>
          { children }
        </div>
      </div>
    );
  }
}

export default Scrollable;
