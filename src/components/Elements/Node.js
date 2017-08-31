import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const textOutOfBounds = (parent, child) => {
  const parentBounds = parent.getBoundingClientRect();
  const childBounds = child.getBoundingClientRect();
  return childBounds.height > parentBounds.height || childBounds.width > parentBounds.width;
};

const scaleIncrement = 1;

// TODO move padding: 33% into stylesheet
function scaleTextToFit(element) {
  element.setAttribute('style', 'position: relative; margin: 33%; ');

  const text = document.createElement('span');
  text.append(element.textContent);
  element.appendChild(text);

  const findFontSize = (size) => {
    text.setAttribute('style', `position: absolute; font-size: ${size}px;`);

    return !textOutOfBounds(element, text) ?
      findFontSize(size + scaleIncrement) :
      size - scaleIncrement;
  };

  const fontSize = findFontSize(8);

  element.removeChild(text);
  element.setAttribute('style', `margin: 33%; font-size: ${fontSize}px; overflow: hidden;`);
}

/**
  * Renders a Node.
  */
class Node extends Component {
  componentDidMount() {
    scaleTextToFit(this.node.querySelectorAll('.node__label')[0]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.label !== this.props.label) {
      scaleTextToFit(this.node.querySelectorAll('.node__label')[0]);
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
