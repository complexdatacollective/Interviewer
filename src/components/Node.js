import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeGetNodeColor } from '../selectors/protocol';
import { Node as UINode } from '../ui/components';

// TODO: using directly here; remove from parents?
import { getNodeLabelFunction } from '../selectors/interface';


const getNodeColor = makeGetNodeColor();

/**
  * Renders a Node.
  */

class Node extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    // On prompt change, is ready immediately
    this.initWorker(props.workerUrl);
  }

  componentDidUpdate() {
    this.initWorker(this.props.workerUrl);
  }

  initWorker(url) {
    if (url && !this.webWorker) {
      this.webWorker = new Worker(url);
      this.webWorker.onmessage = (evt) => {
        // TODO: return string if mapping single node
        this.setState({ label: evt.data[0] });
      };
      // TODO: fix prop commingling
      const node = { ...this.props, dispatch: null, getLabel: null, workerUrl: null };
      this.webWorker.postMessage({
        // TODO: single node unless mapping all
        nodes: [node],
        network: this.props.workerNetwork || {},
        variableRegistry: this.props.workerVariableRegistry || {},
      });
    }
  }

  render() {
    const {
      color,
      workerUrl,
    } = this.props;

    const hasWorker = workerUrl !== false;
    const label = hasWorker ? (this.state.label || '') : this.props.getLabel(this.props);

    return (
      <UINode
        color={color}
        {...this.props}
        label={label}
      />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    color: getNodeColor(state, props),
    getLabel: getNodeLabelFunction(state),
    workerNetwork: state.sessions[state.session].network,
    workerVariableRegistry: state.protocol.variableRegistry,
    workerUrl: state.protocol.workerUrl,
  };
}

Node.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string,
  getLabel: PropTypes.func.isRequired,

  workerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  workerNetwork: PropTypes.object,
  workerVariableRegistry: PropTypes.object,
};

Node.defaultProps = {
  color: 'node-color-seq-1',
  workerUrl: undefined,
  workerNetwork: null,
  workerVariableRegistry: null,
};

export default connect(mapStateToProps)(Node);
