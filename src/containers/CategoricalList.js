import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { find } from 'lodash';

import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { CategoricalItem, NodeList } from '../components/';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getCSSVariableAsString } from '../utils/CSSVariables';
import { getNodeAttributes, nodeAttributesProperty, nodePrimaryKeyProperty } from '../ducks/modules/network';

const colorPresets = [
  getCSSVariableAsString('--cat-color-seq-1'),
  getCSSVariableAsString('--cat-color-seq-2'),
  getCSSVariableAsString('--cat-color-seq-3'),
  getCSSVariableAsString('--cat-color-seq-4'),
  getCSSVariableAsString('--cat-color-seq-5'),
  getCSSVariableAsString('--cat-color-seq-6'),
  getCSSVariableAsString('--cat-color-seq-7'),
  getCSSVariableAsString('--cat-color-seq-8'),
  getCSSVariableAsString('--cat-color-seq-9'),
  getCSSVariableAsString('--cat-color-seq-10'),
];

const getCatColor = (itemNumber) => {
  if (itemNumber > 0) { return colorPresets[itemNumber % colorPresets.length]; }
  return null;
};

class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedBinValue: '',
      accentColor: '',
    };
  }

  getCurrentBinNodes = () => {
    const bin = find(this.props.bins, { value: this.state.expandedBinValue });
    return bin && bin.nodes;
  }

  expandBin = (e, binValue, accentColor) => {
    e.stopPropagation();
    this.setState({
      expandedBinValue: binValue,
      accentColor,
    });
  }

  renderCategoricalBin = (bin, index) => {
    const onDrop = ({ meta }) => {
      if (getNodeAttributes(meta)[this.props.activePromptVariable] === bin.value) {
        return;
      }

      this.props.toggleNodeAttributes(meta[nodePrimaryKeyProperty],
        { [this.props.activePromptVariable]: bin.value });
    };

    const accentColor = getCatColor(index);

    return (
      <CategoricalItem
        id={`CATBIN_ITEM_${this.props.stage.id}_${this.props.prompt.id}_${index}`}
        key={index}
        label={bin.label}
        accentColor={accentColor}
        onDrop={item => onDrop(item)}
        onClick={e => this.expandBin(e, bin.value, accentColor)}
      />
    );
  }

  render() {
    const binDisplay = (
      <div
        className="categorical-list__expanded"
        style={{ borderColor: this.state.accentColor }}
      >
        <NodeList
          listId={`CATBIN_NODE_LIST_${this.props.stage.id}_${this.props.prompt.id}`}
          id={'CATBIN_NODE_LIST'}
          nodes={this.getCurrentBinNodes()}
          sortOrder={this.props.prompt.binSortOrder}
        />
      </div>
    );

    return (
      <div className="categorical-list" onClick={e => this.expandBin(e, '', '')}>
        {this.state.expandedBinValue ? binDisplay : this.props.bins.map(this.renderCategoricalBin)}
      </div>
    );
  }
}

CategoricalList.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  bins: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  toggleNodeAttributes: PropTypes.func.isRequired,
};

CategoricalList.defaultProps = {
  isDragging: false,
  meta: {},
};

function makeMapStateToProps() {
  const getCategoricalValues = makeGetVariableOptions();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForType();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      activePromptVariable,
      bins: getCategoricalValues(state, props)
        .map((bin) => {
          const nodes = stageNodes.filter(
            node =>
              node[nodeAttributesProperty][activePromptVariable] &&
              node[nodeAttributesProperty][activePromptVariable] === bin.value,
          );

          return {
            ...bin,
            nodes,
          };
        }),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    toggleNodeAttributes: bindActionCreators(sessionsActions.toggleNodeAttributes, dispatch),
  };
}

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(CategoricalList);
