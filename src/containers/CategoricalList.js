import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Flipper } from 'react-flip-toolkit';
import { find } from 'lodash';
import cx from 'classnames';

import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { CategoricalItem } from '../components/';
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

/**
  * CategoricalList: Renders a list of categorical bin items
  */
class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandedBinValue: '',
    };
  }

  getCurrentBinNodes = () => {
    const bin = find(this.props.bins, { value: this.state.expandedBinValue });
    return bin && bin.nodes;
  }

  expandBin = (e, binValue) => {
    e.stopPropagation();
    this.setState({
      expandedBinValue: binValue,
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

    const getDetails = (name) => {
      if (name) {
        if (bin.nodes.length > 0) {
          return `${name}${bin.nodes.length > 1 ? ` and ${bin.nodes.length - 1} other${bin.nodes.length > 2 ? 's' : ''}` : ''}`;
        }
      } else if (bin.nodes.length > 0) {
        return `${bin.nodes.length} node${bin.nodes.length > 1 ? 's' : ''}`;
      }
      return 'empty';
    };

    return (
      <CategoricalItem
        id={`CATBIN_ITEM_${this.props.stage.id}_${this.props.prompt.id}_${index}`}
        key={index}
        label={bin.label}
        accentColor={accentColor}
        onDrop={item => onDrop(item)}
        onClick={e => this.expandBin(e, bin.value)}
        details={name => getDetails(name)}
        isExpanded={this.state.expandedBinValue === bin.value}
        nodes={bin.nodes}
        sortOrder={this.props.prompt.binSortOrder}
      />
    );
  }

  render() {
    const classNames = cx(
      'categorical-list__content',
      { 'categorical-list__content--expanded': this.state.expandedBinValue },
    );

    return (
      <div className="categorical-list" onClick={e => this.expandBin(e, '', '')}>
        <Flipper flipKey={this.state.expandedBinValue}>
          <div
            className={classNames}
            style={{ '--num-categorical-items': this.props.bins.length }}
          >
            {this.props.bins.map(this.renderCategoricalBin)}
          </div>
        </Flipper>
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
