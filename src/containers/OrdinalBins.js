import React, { PureComponent } from 'react';
import { compose, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import color from 'color';
import { getNodeLabelFunction, makeNetworkNodesForSubject, makeGetOrdinalValues, makeGetPromptVariable } from '../selectors/interface';
import { actionCreators as networkActions } from '../ducks/modules/network';
import { NodeList } from '../components/';
import { MonitorDragSource } from '../behaviours/DragAndDrop';
import { getCSSVariableAsString } from '../utils/CSSVariables';

class OrdinalBins extends PureComponent {
  static propTypes = {
    activePromptVariable: PropTypes.string.isRequired,
    getLabel: PropTypes.func.isRequired,
    bins: PropTypes.array.isRequired,
    prompt: PropTypes.object.isRequired,
    stage: PropTypes.object.isRequired,
    toggleNodeAttributes: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isDragging: false,
    meta: {},
  };

  renderOrdinalBin = (bin, index) => {
    const stageId = this.props.stage.id;
    const promptId = this.props.prompt.id;
    const promptColor = getCSSVariableAsString(`--${this.props.prompt.color}`) ? color(getCSSVariableAsString(`--${this.props.prompt.color}`)) : color(getCSSVariableAsString('--ord-color-seq-1'));
    const nodes = bin.nodes;
    const accepts = () => true;
    const backgroundColor = color(getCSSVariableAsString('--background'));

    const getAccentColor = () => {
      if (bin.value < 0) {
        return color(getCSSVariableAsString('--color-rich-black')).mix(backgroundColor, 0.8).toString();
      }
      const blendRatio = 1 / (this.props.bins.length) * index;
      return promptColor.mix(backgroundColor, blendRatio).toString();
    };

    const getPanelColor = () => {
      if (bin.value < 0) {
        return color(getCSSVariableAsString('--color-rich-black')).mix(backgroundColor, 0.9).toString();
      }
      const blendRatio = 1 / (this.props.bins.length) * index;
      return color(getCSSVariableAsString('--panel-bg-muted')).mix(backgroundColor, blendRatio).toString();
    };

    const getPanelHighlightColor = () => {
      if (bin.value < 0) {
        return backgroundColor.toString();
      }
      return color(getCSSVariableAsString('--panel-bg-muted')).mix(promptColor, 0.2).toString();
    };

    const onDrop = ({ meta }) => {
      const newValue = {};
      newValue[this.props.activePromptVariable] = bin.value;
      this.props.toggleNodeAttributes(meta.uid, newValue);
    };

    const accentColor = getAccentColor();
    const highlightColor = getPanelHighlightColor();
    const panelColor = getPanelColor();

    return (
      <div className="ordinal-bin" key={index}>
        <div className="ordinal-bin--title" style={{ background: accentColor }}>
          <h3>{bin.label}</h3>
        </div>
        <div className="ordinal-bin--content" style={{ borderBottomColor: accentColor, background: panelColor }}>
          <NodeList
            listId={`ORDBIN_NODE_LIST_${stageId}_${promptId}_${index}`}
            id={`ORDBIN_NODE_LIST_${index}`}
            nodes={nodes}
            label={this.props.getLabel}
            itemType="NEW_NODE"
            onDrop={item => onDrop(item)}
            accepts={accepts}
            hoverColor={highlightColor}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      this.props.bins.map(this.renderOrdinalBin)
    );
  }
}

function makeMapStateToProps() {
  const getOrdinalValues = makeGetOrdinalValues();
  const getPromptVariable = makeGetPromptVariable();
  const getStageNodes = makeNetworkNodesForSubject();

  return function mapStateToProps(state, props) {
    const stageNodes = getStageNodes(state, props);
    const activePromptVariable = getPromptVariable(state, props);
    const getLabel = getNodeLabelFunction(state);

    return {
      activePromptVariable,
      getLabel,
      bins: getOrdinalValues(state, props)
        .map((bin) => {
          const nodes = stageNodes.filter(
            node => node[activePromptVariable] && node[activePromptVariable] === bin.value,
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
    toggleNodeAttributes: bindActionCreators(networkActions.toggleNodeAttributes, dispatch),
  };
}

export { OrdinalBins };

export default compose(
  connect(makeMapStateToProps, mapDispatchToProps),
  MonitorDragSource(['isDragging', 'meta']),
)(OrdinalBins);
