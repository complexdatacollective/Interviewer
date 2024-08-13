import React, { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { getEntityAttributes } from '../../ducks/modules/network';
import { CategoricalItem } from '../../components';
import Overlay from '../Overlay';
import OtherVariableForm from './OtherVariableForm';
import { get } from '../../utils/lodash-replacements';

const formatBinDetails = (nodes, getNodeLabel) => {
  if (nodes.length === 0) {
    return '';
  }

  // todo: the following should be updated to reflect the sort order of the bins
  const name = getNodeLabel(nodes[0]);

  return `${name}${nodes.length > 1 ? ` and ${nodes.length - 1} other${nodes.length > 2 ? 's' : ''}` : ''}`;
};

const otherVariableWindowInitialState = {
  show: false,
  node: null,
};

const CategoricalListItem = (props) => {
  const {
    id,
    size,
    isExpanded,
    accentColor,
    activePromptVariable,
    promptOtherVariable,
    bin,
    index,
    sortOrder,
    getNodeLabel,
    nodeColor,
    onExpandBin,
    updateNode,
    stage,
  } = props;

  const isOtherVariable = !!bin.otherVariable;
  const [otherVariableWindow, setOtherVariableWindow] = useState(otherVariableWindowInitialState);
  const binDetails = formatBinDetails(bin.nodes, getNodeLabel);

  const openOtherVariableWindow = (node) => {
    const otherVariable = get(getEntityAttributes(node), bin.otherVariable);

    setOtherVariableWindow({
      show: true,
      node,
      label: getNodeLabel(node),
      color: nodeColor,
      initialValues: {
        otherVariable,
      },
    });
  };

  const closeOtherVariableWindow = () => setOtherVariableWindow(otherVariableWindowInitialState);

  const setNodeCategory = (node, category) => {
    const variable = bin.otherVariable || activePromptVariable;

    const resetVariable = bin.otherVariable ? activePromptVariable : promptOtherVariable;

    // categorical requires an array, otherVariable is a string
    const value = bin.otherVariable ? category : [category];

    if (getEntityAttributes(node)[variable] === value) {
      return;
    }

    updateNode(
      node[entityPrimaryKeyProperty],
      {},
      {
        [variable]: value,
        // reset is used to clear the variable when a node is moved to a different bin
        ...(!!resetVariable && { [resetVariable]: null }),
      },
      'drop',
    );
  };

  const handleDrop = ({ meta: node }) => {
    const binValue = bin.value;

    if (isOtherVariable) {
      openOtherVariableWindow(node);
      return;
    }

    setNodeCategory(node, binValue);
  };

  const handleClickItem = (node) => {
    if (!isOtherVariable) { return; }
    openOtherVariableWindow(node);
  };

  const handleSubmitOtherVariableForm = ({ otherVariable: value }) => {
    const { node } = otherVariableWindow;

    setNodeCategory(node, value);
    closeOtherVariableWindow();
  };

  const handleExpandBin = (e) => {
    if (e) { e.stopPropagation(); }
    onExpandBin(index);
  };

  return (
    <div
      className="categorical-list__item"
      style={{ width: `${size}px`, height: `${size}px` }}
      key={index}
      onClick={handleExpandBin}
    >
      <CategoricalItem
        id={id}
        key={index}
        label={bin.label}
        accentColor={accentColor}
        onDrop={handleDrop}
        onClick={handleExpandBin}
        onClickItem={handleClickItem}
        details={binDetails}
        isExpanded={isExpanded}
        nodes={bin.nodes}
        sortOrder={sortOrder}
        stage={stage}
      />
      {isOtherVariable
        && (
          <Overlay
            show={otherVariableWindow.show}
            onClose={closeOtherVariableWindow}
            onBlur={closeOtherVariableWindow}
          >
            {otherVariableWindow.show
              && (
                <OtherVariableForm
                  label={otherVariableWindow.label}
                  color={otherVariableWindow.color}
                  otherVariablePrompt={bin.otherVariablePrompt}
                  onSubmit={handleSubmitOtherVariableForm}
                  onCancel={closeOtherVariableWindow}
                  initialValues={otherVariableWindow.initialValues}
                />
              )}
          </Overlay>
        )}
    </div>
  );
};

CategoricalListItem.propTypes = {
  id: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  activePromptVariable: PropTypes.string.isRequired,
  promptOtherVariable: PropTypes.string,
  bin: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  sortOrder: PropTypes.array,
  getNodeLabel: PropTypes.func.isRequired,
  nodeColor: PropTypes.string,
  onExpandBin: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  accentColor: PropTypes.string,
  size: PropTypes.number,
};

CategoricalListItem.defaultProps = {
  promptOtherVariable: null,
  accentColor: null,
  nodeColor: null,
  size: 0,
  sortOrder: [],
};

export { CategoricalListItem };

const mapDispatchToProps = {
  updateNode: sessionsActions.updateNode,
};

export default compose(
  connect(null, mapDispatchToProps),
)(CategoricalListItem);
