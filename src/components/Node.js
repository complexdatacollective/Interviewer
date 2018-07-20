import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getExternalData, makeGetNodeColor } from '../selectors/protocol';
import { Node as UINode } from '../ui/components';

// TODO: using directly here; remove from parents?
import { getNetwork, getNodeLabelFunction } from '../selectors/interface';

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
      this.webWorker.onerror = err => this.setState({ workerError: err });
      this.webWorker.onmessage = evt => this.setState({ label: evt.data });
      // TODO: fix prop commingling
      const node = { ...this.props, dispatch: null, getLabel: null, workerUrl: null };
      this.webWorker.postMessage({
        node,
        network: this.props.workerNetwork || {},
        externalData: this.props.workerExternalData || {},
      });
    }
  }

  render() {
    const {
      color,
      workerUrl,
    } = this.props;

    const useWorkerLabel = workerUrl !== false && !this.state.workerError;
    const label = useWorkerLabel ? (this.state.label || '') : this.props.getLabel(this.props);

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

    // TODO: external selector
    workerUrl: state.protocol.workerUrl,
    workerNetwork: state.protocol.workerUrl && getNetwork(state),
    workerExternalData: state.protocol.workerUrl && getExternalData(state),
  };
}

Node.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string,
  getLabel: PropTypes.func.isRequired,

  workerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  workerNetwork: PropTypes.object,
  workerExternalData: PropTypes.object,
};

Node.defaultProps = {
  color: 'node-color-seq-1',
  workerUrl: undefined,
  workerNetwork: null,
  workerVariableRegistry: null,
  workerExternalData: null,
};

export default connect(mapStateToProps)(Node);
