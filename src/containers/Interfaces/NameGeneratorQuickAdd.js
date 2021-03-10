import React, { Component } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  get, has, omit, debounce,
} from 'lodash';
import withPrompt from '../../behaviours/withPrompt';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForPrompt, makeGetAdditionalAttributes } from '../../selectors/interface';
import { makeGetPromptNodeModelData, makeGetNodeIconName } from '../../selectors/name-generator';
import PromptSwiper from '../PromptSwiper';
import NodePanels from '../NodePanels';
import QuickNodeForm from '../QuickNodeForm';
import { NodeList, NodeBin } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';

/**
  * Name Generator Interface
  * @extends Component
  */
class NameGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedNode: null,
    };
  }

  /**
   * Node Form submit handler
   */
  handleSubmitForm = debounce(({ form }) => {
    const { selectedNode } = this.state;
    const {
      addNode,
      newNodeModelData,
      newNodeAttributes,
      updateNode,
    } = this.props;

    if (form) {
      if (!selectedNode) {
        /**
         *  addNode(modelData, attributeData);
        */
        addNode(
          newNodeModelData,
          { ...newNodeAttributes, ...form },
        );
      } else {
        /**
         * updateNode(nodeId, newModelData, newAttributeData)
         */
        const selectedUID = selectedNode[entityPrimaryKeyProperty];
        updateNode(selectedUID, {}, form);
      }
    }

    this.setState({ selectedNode: null });
  }, 1000, { // This is needed to prevent double submit.
    leading: true,
    trailing: false,
  });

  /**
   * Drop node handler
   * Adds prompt attributes to existing nodes, or adds new nodes to the network.
   * @param {object} item - key/value object containing node object from the network store
   */
  handleDropNode = (item) => {
    const {
      updateNode,
      newNodeModelData,
      newNodeAttributes,
      addNode,
    } = this.props;

    const node = { ...item.meta };

    // Test if we are updating an existing network node, or adding it to the network
    if (has(node, 'promptIDs')) {
      updateNode(
        node[entityPrimaryKeyProperty],
        { ...newNodeModelData },
        { ...newNodeAttributes },
      );
    } else {
      const droppedAttributeData = node[entityAttributesProperty];
      const droppedModelData = omit(node, entityAttributesProperty);

      addNode(
        { ...newNodeModelData, ...droppedModelData },
        { ...droppedAttributeData, ...newNodeAttributes },
      );
    }
  }

  render() {
    const {
      nodesForPrompt,
      newNodeAttributes,
      newNodeModelData,
      nodeIconName,
      prompt,
      promptBackward,
      promptForward,
      stage,
      addNode,
      removeNode,
    } = this.props;

    const {
      prompts,
      quickAdd,
    } = stage;

    return (
      <div className="name-generator-interface">
        <div className="name-generator-interface__prompt">
          <PromptSwiper
            forward={promptForward}
            backward={promptBackward}
            prompt={prompt}
            prompts={prompts}
          />
        </div>
        <div className="name-generator-interface__main">
          <div className="name-generator-interface__panels">
            <NodePanels stage={stage} prompt={prompt} />
          </div>
          <div className="name-generator-interface__nodes">
            <NodeList
              items={nodesForPrompt}
              listId={`${stage.id}_${prompt.id}_MAIN_NODE_LIST`}
              id="MAIN_NODE_LIST"
              accepts={({ meta }) => get(meta, 'itemType', null) === 'NEW_NODE'}
              itemType="EXISTING_NODE"
              onDrop={this.handleDropNode}
              onItemClick={this.handleSelectNode}
            />
          </div>
        </div>

        <QuickNodeForm
          stage={stage}
          targetVariable={quickAdd}
          addNode={addNode}
          nodeIconName={nodeIconName}
          newNodeAttributes={newNodeAttributes}
          newNodeModelData={newNodeModelData}
        />

        <NodeBin
          accepts={(meta) => meta.itemType === 'EXISTING_NODE'}
          dropHandler={(meta) => removeNode(meta[entityPrimaryKeyProperty])}
          id="NODE_BIN"
        />
      </div>
    );
  }
}

NameGenerator.defaultProps = {
  quickAdd: null,
};

NameGenerator.propTypes = {
  addNode: PropTypes.func.isRequired,
  quickAdd: PropTypes.string,
  newNodeAttributes: PropTypes.object.isRequired,
  newNodeModelData: PropTypes.object.isRequired,
  nodesForPrompt: PropTypes.array.isRequired,
  nodeIconName: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  promptBackward: PropTypes.func.isRequired,
  promptForward: PropTypes.func.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const networkNodesForPrompt = makeNetworkNodesForPrompt();
  const getPromptNodeAttributes = makeGetAdditionalAttributes();
  const getPromptNodeModelData = makeGetPromptNodeModelData();
  const getNodeIconName = makeGetNodeIconName();

  return function mapStateToProps(state, props) {
    return {
      activePromptAttributes: props.prompt.additionalAttributes,
      newNodeAttributes: getPromptNodeAttributes(state, props),
      newNodeModelData: getPromptNodeModelData(state, props),
      nodesForPrompt: networkNodesForPrompt(state, props),
      nodeIconName: getNodeIconName(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(sessionsActions.addNode, dispatch),
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export default compose(
  withPrompt,
  connect(makeMapStateToProps, mapDispatchToProps),
)(NameGenerator);

export {
  NameGenerator as UnconnectedNameGenerator,
};
