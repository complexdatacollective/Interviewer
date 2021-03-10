import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, window } from '@codaco/ui';
import { Radio } from '@codaco/ui/lib/components/Fields';
import { Accordion } from '.';

import {
  makeGetEdgeColor, makeGetEdgeLabel, makeGetNodeAttributeLabel, makeGetCategoricalOptions,
} from '../../selectors/network';

class PresetSwitcherKey extends Component {
  constructor() {
    super();
    this.state = {
      open: false,

    };

    this.panel = React.createRef();
  }

  togglePanel = () => {
    const { open } = this.state;
    this.setState({
      open: !open,
    });
  }

  renderHighlightLabel = (highlight, index) => {
    const {
      highlightIndex,
      toggleHighlightIndex,
    } = this.props;

    const handleHighlightClick = (event) => {
      event.stopPropagation();
      toggleHighlightIndex(index);
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
      convexOptions,
      edges,
      highlightLabels,
      toggleConvex,
      toggleEdges,
      toggleHighlights,
      open,
    } = this.props;

    const classNames = cx(
      'preset-switcher-key',
      { 'preset-switcher-key--open': open },
    );

    return (
      <div className={classNames} ref={this.panel}>
        <div className="preset-switcher-key__content">
          <Accordion label="Attributes" onAccordionToggle={toggleHighlights}>
            {highlightLabels.map(this.renderHighlightLabel)}
          </Accordion>
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
          <Accordion label="Groups" onAccordionToggle={toggleConvex}>
            {convexOptions.map((option, index) => (
              <div className="accordion-item" key={index}>
                <Icon
                  name="contexts"
                  color={`cat-color-seq-${index + 1}`}
                />
                {option.label}
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    );
  }
}

PresetSwitcherKey.propTypes = {
  convexOptions: PropTypes.array,
  edges: PropTypes.array,
  highlightLabels: PropTypes.array,
  highlightIndex: PropTypes.number,
  toggleConvex: PropTypes.func,
  toggleEdges: PropTypes.func,
  toggleHighlights: PropTypes.func,
  toggleHighlightIndex: PropTypes.func,
  open: PropTypes.bool.isRequired,
};

PresetSwitcherKey.defaultProps = {
  edges: [],
  convexOptions: [],
  highlightLabels: [],
  highlightIndex: 0,
  toggleConvex: () => {},
  toggleEdges: () => {},
  toggleHighlights: () => {},
  toggleHighlightIndex: () => {},
};

const makeMapStateToProps = () => {
  const getEdgeColor = makeGetEdgeColor();
  const getEdgeLabel = makeGetEdgeLabel();
  const getNodeAttributeLabel = makeGetNodeAttributeLabel();
  const getCategoricalOptions = makeGetCategoricalOptions();

  const mapStateToProps = (state, props) => {
    const highlightLabels = props.highlights.map((variable) => (
      getNodeAttributeLabel(state, { variableId: variable, ...props })
    ));
    const edges = props.displayEdges.map((type) => (
      { label: getEdgeLabel(state, { type }), color: getEdgeColor(state, { type }) }
    ));
    const convexOptions = getCategoricalOptions(state,
      { variableId: props.convexHulls, ...props });

    return {
      convexOptions,
      edges,
      highlightLabels,
    };
  };

  return mapStateToProps;
};

export default compose(
  window,
  connect(makeMapStateToProps),
)(PresetSwitcherKey);

export {
  PresetSwitcherKey,
};
