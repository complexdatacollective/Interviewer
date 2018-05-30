import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeGetNodeColor } from '../selectors/protocol';
import { Node as UINode } from '../ui/components';

const getNodeColor = makeGetNodeColor();

/**
  * Renders a Node.
  */

class Node extends PureComponent {
  render() {
    const {
      color,
    } = this.props;

    return (
      <UINode
        color={color}
        {...this.props}
      />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    color: getNodeColor(state, props),
  };
}

Node.propTypes = {
  /* eslint-disable react/no-unused-prop-types */
  type: PropTypes.string.isRequired,
  color: PropTypes.string,
};

Node.defaultProps = {
  color: 'node-color-seq-1',
};

export default connect(mapStateToProps)(Node);
