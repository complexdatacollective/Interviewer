import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const childOutOfBounds = (parentBounds, childBounds) =>
  childBounds.height > parentBounds.height || childBounds.width > parentBounds.width;

const scaleIncrement = 1;

// TODO move padding: 33% into stylesheet
function scaleTextToFit(parent, child) {
  let childBounds = { width: 10000, height: 10000 };
  const parentBounds = parent.getBoundingClientRect();
  parent.setAttribute('style', 'position: relative;');

  const findFontSize = (size) => {
    child.setAttribute('style', `position: absolute; height: auto; width: auto; padding: 33%; font-size: ${size}px;`);
    childBounds = child.getBoundingClientRect();
    return !childOutOfBounds(parentBounds, childBounds) ?
      findFontSize(size + scaleIncrement) :
      size - scaleIncrement;
  };

  const fontSize = findFontSize(8);

  parent.removeAttribute('style');
  child.setAttribute('style', `font-size: ${fontSize}px;`);
}

/**
  * Renders a Node.
  */
class Node extends Component {
  componentDidMount() {
    scaleTextToFit(this.node, this.node.querySelectorAll('.node__label')[0]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.label !== this.props.label) {
      scaleTextToFit(this.node, this.node.querySelectorAll('.node__label')[0]);
    }
  }

  render() {
    const {
      selected,
      placeholder,
    } = this.props;

    const classes = classNames(
      'node',
      {
        'node--selected': selected,
        'node--placeholder': placeholder,
      },
    );

    const label = placeholder ? '+' : this.props.label;

    return (
      <div
        className={classes}
        ref={(node) => { this.node = node; }}
      >
        <svg
          viewBox="-1.5 -1.5 3 3"
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          className="node__node"
        >
          <circle vectorEffect="non-scaling-stroke" cx="0" cy="0" r="1" className="node__node-outer-trim" />
          <circle cx="0" cy="0" r="1" fill="silver" className="node__node-base" />
          <path
            className="node__node-flash"
            d="M -1 0 A 0.2,0.2 0 1,1 1,0"
            fill="grey"
            transform="rotate(135)"
          />
          <circle vectorEffect="non-scaling-stroke" cx="0" cy="0" r="1" className="node__node-trim" />
        </svg>
        <div className="node__label">{label}</div>
      </div>
    );
  }
}

Node.propTypes = {
  label: PropTypes.string,
  selected: PropTypes.bool,
  placeholder: PropTypes.bool,
};

Node.defaultProps = {
  label: 'Node',
  selected: false,
  placeholder: false,
};

export default Node;
