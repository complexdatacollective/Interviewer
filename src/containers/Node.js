import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import WorkerAgent from '../utils/WorkerAgent';
import { Node as UINode } from '../ui/components';
import { getWorkerNetwork, getNodeLabelFunction } from '../selectors/interface';
import { getNodeLabelWorkerUrl, makeGetNodeColor, makeGetNodeTypeDefinition } from '../selectors/protocol';
import { asWorkerAgentNode } from '../ducks/modules/network';

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

    // Create an object containing the node's model properties
    const node = asWorkerAgentNode(this.props, this.props.nodeTypeDefinition);

    // Send the worker the node model properties along with the network
    const msgPromise = this.webWorker.sendMessageAsync({
      node,
      network: this.props.workerNetwork || {},
    });
    this.outstandingMessage = msgPromise.cancellationId;
    msgPromise
      .then((label) => {
        if (!label) {
          console.warn('Empty label returned for node', this.props); // eslint-disable-line no-console
          throw new Error('Empty label');
        }
        this.setState({ label });
      })
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
  const getNodeColor = makeGetNodeColor();
  const getNodeTypeDefinition = makeGetNodeTypeDefinition();

  return {
    color: getNodeColor(state, props),
    nodeTypeDefinition: getNodeTypeDefinition(state, props),
    getLabel: getNodeLabelFunction(state),
    workerUrl: getNodeLabelWorkerUrl(state),
    workerNetwork: (getNodeLabelWorkerUrl(state) && getWorkerNetwork(state)) || null,
  };
}

Node.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string,
  getLabel: PropTypes.func.isRequired,
  nodeTypeDefinition: PropTypes.object,
  workerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  workerNetwork: PropTypes.object,
};

Node.defaultProps = {
  color: 'node-color-seq-1',
  nodeTypeDefinition: null,
  workerUrl: undefined,
  workerNetwork: null,
};

export default connect(mapStateToProps)(Node);

export { Node };
