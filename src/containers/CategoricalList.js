import React, { Component } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Flipper } from 'react-flip-toolkit';
import cx from 'classnames';

import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable, makeGetNodeDisplayVariable } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { CategoricalItem } from '../components/';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getCSSVariableAsString } from '../ui/utils/CSSVariables';
import { getNodeAttributes, nodeAttributesProperty, nodePrimaryKeyProperty } from '../ducks/modules/network';

/**
  * CategoricalList: Renders a list of categorical bin items
  */
class CategoricalList extends Component {
  constructor(props) {
    super(props);
    this.categoricalComponent = React.createRef();
    this.state = {
      expandedBinValue: '',
    };
  }

  getAvailableHeight() {
    return this.categoricalComponent.current ? this.categoricalComponent.current.offsetHeight : 0;
  }

  getDetails = (nodes) => {
    if (nodes.length === 0) {
      return '';
    }

    // todo: the following should be updated to reflect the sort order of the bins
    const name = nodes[0][nodeAttributesProperty] && this.props.displayVariable &&
      nodes[0][nodeAttributesProperty][this.props.displayVariable];

    if (nodes.length > 0) {
      return `${name}${nodes.length > 1 ? ` and ${nodes.length - 1} other${nodes.length > 2 ? 's' : ''}` : ''}`;
    }

    return '';
  };

  expandBin = (e, binValue) => {
    if (e) e.stopPropagation();
    this.setState({
      expandedBinValue: binValue,
    });
  }

  renderCategoricalBin = (bin, index) => {
    const onDrop = ({ meta }) => {
      if (getNodeAttributes(meta)[this.props.activePromptVariable] === [bin.value]) {
        return;
      }

      this.props.updateNode(
        meta[nodePrimaryKeyProperty],
        {},
        { [this.props.activePromptVariable]: [bin.value] },
      );
    };

    const binDetails = this.getDetails(bin.nodes);

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
      if (itemNumber >= 0) { return colorPresets[itemNumber % colorPresets.length]; }
      return null;
    };

    return (
      <CategoricalItem
        id={`CATBIN_ITEM_${this.props.stage.id}_${this.props.prompt.id}_${index}`}
        key={index}
        label={bin.label}
        accentColor={getCatColor(index)}
        onDrop={item => onDrop(item)}
        onClick={e => this.expandBin(e, bin.value)}
        details={binDetails}
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
    const styleNames = { '--num-categorical-items': this.props.bins.length };
    if (this.props.bins.length < 4) {
      styleNames['--categorical-item-multiplier'] = 1.2;
    }

    return (
      <Flipper flipKey={this.state.expandedBinValue} className="categorical-list">
        <div
          className="categorical-list__inner"
          onClick={e => this.expandBin(e, '', '')}
          ref={this.categoricalComponent}
          style={{ '--categorical-available-height': `${Math.floor(this.getAvailableHeight())}px` }}
        >
          <div className="categorical-list__expanded-bin">
            {this.props.bins.map(this.renderCategoricalBin).filter((bin, index) =>
              this.props.bins[index].value === this.state.expandedBinValue,
            )}
          </div>
          <div
            className={classNames}
            style={styleNames}
          >
            {this.props.bins.map(this.renderCategoricalBin).filter((bin, index) =>
              this.props.bins[index].value !== this.state.expandedBinValue,
            )}
          </div>
        </div>
      </Flipper>
    );
  }
}

CategoricalList.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  bins: PropTypes.array.isRequired,
  displayVariable: PropTypes.string.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

CategoricalList.defaultProps = {
  isDragging: false,
  meta: {},
};

function makeMapStateToProps() {
  const getCategoricalValues = makeGetVariableOptions();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForType();
  const getNodeDisplayVariable = makeGetNodeDisplayVariable();

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
              node[nodeAttributesProperty][activePromptVariable].includes(bin.value),
          );

          return {
            ...bin,
            nodes,
          };
        }),
      displayVariable: getNodeDisplayVariable(state, props),
    };
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export { CategoricalList as UnconnectedCategoricalList };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(CategoricalList);
