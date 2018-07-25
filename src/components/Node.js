import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { makeGetNodeColor } from '../selectors/protocol';
import { Node as UINode } from '../ui/components';

import WorkerAgent from '../utils/WorkerAgent';
import { getNetwork, getNodeLabelFunction } from '../selectors/interface';

const getNodeColor = makeGetNodeColor();

/**
  * Renders a Node.
  */
class Node extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.initWorker(props.workerUrl);
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.state.label === nextState.label) {
      // Unless the label has changed, we need to check for an update
      this.initWorker(this.props.workerUrl);
    }
  }

  componentWillUnmount() {
    if (this.webWorker && this.outstandingMessage) {
      this.webWorker.cancelMessage(this.outstandingMessage);
    }
  }

  initWorker(url) {
    if (!url || this.state.workerError) {
      return;
    }
    if (!this.webWorker) {
      this.webWorker = new WorkerAgent(url);
    }
    // TODO: fix prop commingling (#596); this shouldn't be needed
    const node = { ...this.props, dispatch: null, getLabel: null, workerUrl: null };
    const msgPromise = this.webWorker.sendMessageAsync({
      node,
      network: this.props.workerNetwork || {},
    });
    this.outstandingMessage = msgPromise.cancellationId;
    msgPromise
      .then(label => this.setState({ label }))
      .catch(workerError => this.setState({ workerError }));
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
    workerUrl: state.protocol.workerUrl,
    workerNetwork: (state.protocol.workerUrl && getNetwork(state)) || null,
  };
}

Node.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string,
  getLabel: PropTypes.func.isRequired,
  workerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  workerNetwork: PropTypes.object,
};

Node.defaultProps = {
  color: 'node-color-seq-1',
  workerUrl: undefined,
  workerNetwork: null,
  workerVariableRegistry: null,
};

export default connect(mapStateToProps)(Node);
