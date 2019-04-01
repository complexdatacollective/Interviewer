/* eslint-disable: no-underscore-dangle */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { get } from 'lodash';
import {
  makeNetworkNodesForPrompt as makeGetNodesForPrompt,
  makeNetworkNodesForOtherPrompts as makeGetNodesForOtherPrompts,
} from '../selectors/interface';
import { Panel, NodeList } from '../components/';
import withExternalData from './withExternalData';
import { entityPrimaryKeyProperty } from '../ducks/modules/network';

class NodePanel extends PureComponent {
  componentDidMount() {
    this.sendNodesUpdate(this.props.nodes);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodes.length !== this.props.nodes.length) {
      this.sendNodesUpdate(nextProps.nodes);
    }
  }

  // Because the index is used to determine whether node originated in this list
  // we need to supply an index for the unfiltered list for externalData.
  fullNodeIndex = (nodes) => {
    const {
      dataSource,
      externalData,
    } = this.props;
    const externalNodes = get(externalData, 'nodes', []);
    const allNodes = (dataSource === 'existing' ? nodes : externalNodes);

    return new Set(allNodes.map(node => node[entityPrimaryKeyProperty]));
  }

  // This can use the displayed nodes for a count as it is used to see whether the panel
  // is 'empty'
  nodeDisplayCount = nodes => nodes.length;

  sendNodesUpdate = (nodes) => {
    this.props.onUpdate(
      this.nodeDisplayCount(nodes),
      this.fullNodeIndex(nodes),
    );
  }

  handleDrop = item =>
    this.props.onDrop(item, this.props.dataSource);

  render = () => {
    const {
      title,
      highlight,
      dataSource,
      id,
      listId,
      minimise,
      onDrop,
      nodes,
      ...nodeListProps
    } = this.props;
    return (
      <Panel
        title={title}
        highlight={highlight}
        minimise={minimise}
      >
        <NodeList
          {...nodeListProps}
          nodes={nodes}
          listId={listId}
          id={id}
          itemType="NEW_NODE"
          onDrop={this.handleDrop}
        />
      </Panel>
    );
  }
}


const getNodeId = node => node[entityPrimaryKeyProperty];

const makeGetNodes = () => {
  const getNodesForPrompt = makeGetNodesForPrompt();
  const getNodesForOtherPrompts = makeGetNodesForOtherPrompts();

  return (state, props) => {
    const nodesForPrompt = getNodesForPrompt(state, props);
    const nodesForOtherPrompts = getNodesForOtherPrompts(state, props);
    const nodeIds = {
      prompt: nodesForPrompt.map(getNodeId),
      other: nodesForOtherPrompts.map(getNodeId),
    };

    const notInSet = set =>
      node => !set.has(node[entityPrimaryKeyProperty]);

    if (props.dataSource === 'existing') {
      const nodes = nodesForOtherPrompts
        .filter(notInSet(new Set(nodeIds.prompt)));

      return nodes;
    }

    if (!props.externalData) { return []; }

    const nodes = get(
      props.externalData,
      'nodes',
      [],
    )
      .filter(notInSet(new Set([...nodeIds.prompt, ...nodeIds.other])));
    return nodes;
  };
};

const makeMapStateToProps = () => {
  const getNodes = makeGetNodes();

  return (state, props) => {
    const nodes = getNodes(state, props);

    return {
      nodes,
    };
  };
};

export { NodePanel };

export default compose(
  withExternalData('externalDataSource', 'externalData'),
  connect(makeMapStateToProps),
)(NodePanel);
