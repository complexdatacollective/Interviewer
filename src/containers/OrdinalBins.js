import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';
import color from 'color';
import { MarkdownLabel } from '@codaco/ui/lib/components/Fields';
import { getCSSVariableAsString } from '@codaco/ui/lib/utils/CSSVariables';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '@codaco/shared-consts';
import { makeNetworkNodesForType, makeGetVariableOptions, makeGetPromptVariable } from '../selectors/interface';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { NodeList } from '../components';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getEntityAttributes } from '../ducks/modules/network';

class OrdinalBins extends PureComponent {
  promptColor = () => {
    const { prompt } = this.props;

    return prompt.color
      ? color(getCSSVariableAsString(`--${prompt.color}`))
      : color(getCSSVariableAsString('--ord-color-seq-1'));
  };

  backgroundColor = () => color(getCSSVariableAsString('--background'));

  calculateAccentColor = (index, missingValue) => {
    const { bins } = this.props;
    if (missingValue) {
      return color(getCSSVariableAsString('--color-rich-black')).mix(this.backgroundColor(), 0.8).toString();
    }
    const blendRatio = 1 / (bins.length) * index;
    return this.promptColor().mix(this.backgroundColor(), blendRatio).toString();
  };

  calculatePanelColor = (index, missingValue) => {
    const { bins } = this.props;
    if (missingValue) {
      return color(getCSSVariableAsString('--color-rich-black')).mix(this.backgroundColor(), 0.9).toString();
    }
    const blendRatio = 1 / (bins.length) * index;
    return color(getCSSVariableAsString('--panel-bg-muted')).mix(this.backgroundColor(), blendRatio).toString();
  };

  calculatePanelHighlightColor = (missingValue) => {
    if (missingValue) {
      return this.backgroundColor().toString();
    }
    return color(getCSSVariableAsString('--panel-bg-muted')).mix(this.promptColor(), 0.2).toString();
  };

  renderOrdinalBin = (bin, index) => {
    const {
      prompt,
      stage,
      activePromptVariable,
      updateNode,
    } = this.props;
    const missingValue = bin.value < 0;

    const onDrop = ({ meta }) => {
      if (getEntityAttributes(meta)[activePromptVariable] === bin.value) {
        return;
      }

      updateNode(
        meta[entityPrimaryKeyProperty],
        {},
        { [activePromptVariable]: bin.value },
        'drop',
      );
    };

    const accentColor = this.calculateAccentColor(index, missingValue);
    const highlightColor = this.calculatePanelHighlightColor(missingValue);
    const panelColor = this.calculatePanelColor(index, missingValue);

    return (
      <div className="ordinal-bin" key={index}>
        <div className="ordinal-bin--title" style={{ background: accentColor }}>
          <h3 className="ordinal-bin--title h3">
            <MarkdownLabel label={bin.label} inline />
          </h3>
        </div>
        <div className="ordinal-bin--content" style={{ borderBottomColor: accentColor, background: panelColor }}>
          <NodeList
            stage={stage}
            listId={`ORDBIN_NODE_LIST_${stage.id}_${prompt.id}_${index}`}
            id={`ORDBIN_NODE_LIST_${index}`}
            items={bin.nodes}
            itemType="NEW_NODE"
            onDrop={(item) => onDrop(item)}
            accepts={() => true}
            hoverColor={highlightColor}
            sortOrder={prompt.binSortOrder}
          />
        </div>
      </div>
    );
  }

  render() {
    const { bins } = this.props;
    return (
      bins.map(this.renderOrdinalBin)
    );
  }
}

OrdinalBins.propTypes = {
  activePromptVariable: PropTypes.string.isRequired,
  bins: PropTypes.array.isRequired,
  prompt: PropTypes.object.isRequired,
  stage: PropTypes.object.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function makeMapStateToProps() {
  const getOrdinalValues = makeGetVariableOptions();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForType();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);

    return {
      activePromptVariable,
      bins: getOrdinalValues(state, props)
        .map((bin) => {
          const nodes = stageNodes.filter(
            (node) => !isNil(node[entityAttributesProperty][activePromptVariable])
              && node[entityAttributesProperty][activePromptVariable] === bin.value,
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
    updateNode: bindActionCreators(sessionsActions.updateNode, dispatch),
  };
}

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(OrdinalBins);
