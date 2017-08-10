/* eslint-disable react/prop-types */

import { CSSTransitionGroup } from 'react-transition-group';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flow, map, differenceBy, sortBy } from 'lodash';

const itemIndexes = items =>
  items.reduce(
    (memo, item, i) =>
      Object.assign(memo, { [item.key]: i }),
    {},
  );

class StaggeredTransitionGroup extends Component {
  constructor() {
    super();
    this.state = {
      newItems: itemIndexes([]),
      firstRender: true,
    };
  }

  componentWillMount() {
    const children = React.Children.toArray(this.props.children);

    this.setState({
      newItems: itemIndexes(children),
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextChildren = React.Children.toArray(nextProps.children);

    const newChildren = [
      ...differenceBy(
        nextChildren,
        React.Children.toArray(this.props.children),
        'key',
      ),
    ];

    if (newChildren.length === 0) {
      this.setState({
        newItems: itemIndexes(nextChildren),
        firstRender: true,
      });
    } else {
      this.setState({
        newItems: itemIndexes(newChildren),
        firstRender: false,
      });
    }
  }

  isNew(key) {
    return Object.hasOwnProperty.call(this.state.newItems, key);
  }

  itemIndex(key) {
    return this.isNew(key)
      ? this.state.newItems[key]
      : 0;
  }

  totalTime() {
    const { delay, duration, start } = this.props;
    const { newItems } = this.state;

    return duration
      ? (
        (this.state.firstRender && start)
        + (Object.keys(newItems).length * delay)
        + duration
      )
      : 0;
  }

  transitionDelay(child) {
    const { delay, start } = this.props;
    const { firstRender } = this.state;

    return `${((firstRender && start) + (this.itemIndex(child.key) * delay))}ms`;
  }

  childStyle(child) {
    return { transitionDelay: this.transitionDelay(child) };
  }

  render() {
    const { transitionName, className, component } = this.props;

    const sortByNew = children => sortBy(
      children,
      child => (this.isNew(child.key) ? 1 : 0),
    );

    const withStyles = children => map(
      children,
      child =>
        React.cloneElement(
          child,
          { style: this.childStyle(child) },
        ),
    );

    const children = flow([
      withStyles,
      sortByNew,
    ])(React.Children.toArray(this.props.children));

    return (
      <CSSTransitionGroup
        className={className}
        transitionName={transitionName}
        transitionAppear
        transitionAppearTimeout={this.totalTime()}
        transitionEnterTimeout={this.totalTime()}
        transitionLeave={false}
        component={component}
      >
        {children}
      </CSSTransitionGroup>
    );
  }
}

StaggeredTransitionGroup.propTypes = Object.assign({}, CSSTransitionGroup.propTypes, {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  delay: PropTypes.number,
  start: PropTypes.number,
  className: PropTypes.string,
  component: PropTypes.any,
});

StaggeredTransitionGroup.defaultProps = {
  delay: 100,
  duration: 0,
  start: 0,
  className: '',
  component: null,
};

export default StaggeredTransitionGroup;
