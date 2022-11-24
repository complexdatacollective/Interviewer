import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import { Icon, window } from '@codaco/ui';
import { Radio, MarkdownLabel } from '@codaco/ui/lib/components/Fields';
import Accordion from './Accordion';
import {
  makeGetEdgeColor, makeGetEdgeLabel, makeGetNodeAttributeLabel, makeGetCategoricalOptions,
} from '../../selectors/network';
import { get } from '../../utils/lodash-replacements';

class PresetSwitcherKey extends Component {
  constructor() {
    super();
    this.state = {
      isOpen: false,

    };

    this.panel = React.createRef();
  }

  togglePanel = () => {
    this.setState((oldState) => ({
      isOpen: !oldState.isOpen,
    }));
  }

  renderHighlightLabel = (highlight, index) => {
    const {
      highlightIndex,
      changeHighlightIndex,
    } = this.props;

    const handleHighlightClick = (event) => {
      event.stopPropagation();
      changeHighlightIndex(index);
    };

    return (
      <Radio
        className="accordion-item"
        key={index}
        input={{
          value: index,
          checked: index === highlightIndex,
          onChange: (event) => handleHighlightClick(event, index),
        }}
        label={highlight}
      />
    );
  }

  render() {
    const {
      toggleHighlighting,
      toggleEdges,
      toggleHulls,
      isOpen,
      convexOptions,
      edges,
      highlightLabels,
    } = this.props;

    const classNames = cx(
      'preset-switcher-key',
      { 'preset-switcher-key--open': isOpen },
    );

    return (
      <div className={classNames} ref={this.panel}>
        <div className="preset-switcher-key__content">
          {!isEmpty(highlightLabels) && (
            <Accordion label="Attributes" onAccordionToggle={toggleHighlighting}>
              {highlightLabels.map(this.renderHighlightLabel)}
            </Accordion>
          )}
          {!isEmpty(edges) && (
            <Accordion label="Links" onAccordionToggle={toggleEdges}>
              {edges.map((edge, index) => (
                <div className="accordion-item" key={index}>
                  <Icon
                    name="links"
                    color={edge.color}
                  />
                  {edge.label}
                </div>
              ))}
            </Accordion>
          )}
          {!isEmpty(convexOptions) && (
            <Accordion label="Groups" onAccordionToggle={toggleHulls}>
              {convexOptions.map((option, index) => (
                <div className="accordion-item" key={index}>
                  <Icon
                    name="contexts"
                    color={`cat-color-seq-${index + 1}`}
                  />
                  <MarkdownLabel inline label={option.label} />
                </div>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    );
  }
}

PresetSwitcherKey.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  preset: PropTypes.object.isRequired,
  highlightIndex: PropTypes.number.isRequired,
  changeHighlightIndex: PropTypes.func.isRequired,
  toggleHighlighting: PropTypes.func.isRequired,
  toggleEdges: PropTypes.func.isRequired,
  toggleHulls: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

PresetSwitcherKey.defaultProps = {
};

const makeMapStateToProps = () => {
  const getEdgeColor = makeGetEdgeColor();
  const getEdgeLabel = makeGetEdgeLabel();
  const getNodeAttributeLabel = makeGetNodeAttributeLabel();
  const getCategoricalOptions = makeGetCategoricalOptions();

  const mapStateToProps = (state, props) => {
    const highlightLabels = get(props, 'preset.highlight', [])
      .map((variable) => (
        getNodeAttributeLabel(state, { variableId: variable, ...props })
      ));
    const edges = get(props, 'preset.edges.display', [])
      .map((type) => (
        { label: getEdgeLabel(state, { type }), color: getEdgeColor(state, { type }) }
      ));
    const convexOptions = getCategoricalOptions(
      state,
      { variableId: props.preset.groupVariable, ...props },
    );

    return {
      convexOptions,
      edges,
      highlightLabels,
    };
  };

  return mapStateToProps;
};

export {
  PresetSwitcherKey as UnconnectedPresetSwitcherKey,
};

export default compose(
  window,
  connect(makeMapStateToProps),
)(PresetSwitcherKey);
