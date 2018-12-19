import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Icon } from '../../ui/components';
import { Accordion } from '.';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { makeGetEdgeColor, makeGetEdgeLabel, makeGetNodeAttributeLabel, makeGetCategoricalOptions } from '../../selectors/protocol';

class NarrativeControlPanel extends Component {
  constructor() {
    super();

    this.state = {
      open: true,
    };
    this.panel = React.createRef();
  }

  componentDidMount() {
    this.setSideSpacing(this.getComponentWidth());
  }

  componentDidUpdate() {
    this.setSideSpacing(this.getComponentWidth());
  }

  componentWillUnmount() {
    this.setSideSpacing(0);
  }

  getComponentWidth = () => (this.state.open ? getComputedStyle(this.panel.current).getPropertyValue('--narrative-panel-width') : 0);

  setSideSpacing = (right) => {
    const app = document.getElementsByClassName('app')[0];

    if (app) {
      app.style.setProperty('--right-edge-position', right);
    }
  }

  togglePanel = () => {
    this.setState({
      open: !this.state.open,
    }, this.setSideSpacing(this.getComponentWidth()));
  }

  createPresetList = (preset, index) => {
    const classes = cx(
      'accordion-item__radio',
      { 'accordion-item__radio--selected': this.props.presetIndex === index },
    );
    return (
      <div className="accordion-item" key={index} onClick={() => this.props.updatePreset(index)}>
        <span className={classes} />
        {preset.label}
      </div>
    );
  };

  render() {
    const {
      convexOptions,
      edges,
      highlightLabels,
      presets,
      toggleConvex,
      toggleEdges,
      toggleHighlights,
    } = this.props;

    const classNames = cx(
      'narrative-control-panel',
      { 'narrative-control-panel--open': this.state.open },
    );

    return (
      <div className={classNames} ref={this.panel}>
        <div className="narrative-control-panel__toggle" onClick={this.togglePanel}>
          <Icon
            name="chevron-right"
            color="white"
            className="narrative-control-panel__icon narrative-control-panel__icon--open"
          />
          <Icon
            name="chevron-left"
            color="white"
            className="narrative-control-panel__icon narrative-control-panel__icon--close"
          />
        </div>
        <div className="narrative-control-panel__content">
          <Accordion label="Presets">
            <div>
              {presets.map(this.createPresetList)}
            </div>
          </Accordion>
          <Accordion open label="Highlighted">
            <div onClick={toggleHighlights}>
              {highlightLabels.map((highlight, index) => (
                <div className="accordion-item" key={index}>
                  <Icon
                    name="highlighted"
                    color={highlight.color}
                  />
                  {highlight.label}
                </div>
              ))}
            </div>
          </Accordion>
          <Accordion open label="Links">
            <div onClick={toggleEdges}>
              {edges.map((edge, index) => (
                <div className="accordion-item" key={index}>
                  <Icon
                    name="links"
                    color={edge.color}
                  />
                  {edge.label}
                </div>
              ))}
            </div>
          </Accordion>
          <Accordion open label="Contexts">
            <div onClick={toggleConvex}>
              {convexOptions.map((option, index) => (
                <div className="accordion-item" key={index}>
                  <Icon
                    name="contexts"
                    color={`cat-color-seq-${index + 1}`}
                  />
                  {option.label}
                </div>
              ))}
            </div>
          </Accordion>
        </div>
      </div>
    );
  }
}

NarrativeControlPanel.propTypes = {
  convexOptions: PropTypes.array,
  edges: PropTypes.array,
  highlightLabels: PropTypes.array,
  presets: PropTypes.array,
  presetIndex: PropTypes.number,
  toggleConvex: PropTypes.func,
  toggleEdges: PropTypes.func,
  toggleHighlights: PropTypes.func,
  updatePreset: PropTypes.func,
};

NarrativeControlPanel.defaultProps = {
  edges: [],
  convexOptions: [],
  highlightLabels: [],
  presets: [],
  presetIndex: 0,
  toggleConvex: () => {},
  toggleEdges: () => {},
  toggleHighlights: () => {},
  updatePreset: () => {},
};

const makeMapStateToProps = () => {
  const getEdgeColor = makeGetEdgeColor();
  const getEdgeLabel = makeGetEdgeLabel();
  const getNodeAttributeLabel = makeGetNodeAttributeLabel();
  const getCategoricalOptions = makeGetCategoricalOptions();

  const mapStateToProps = (state, props) => {
    const highlightLabels = props.highlights.map(({ variable, color }) => (
      { label: getNodeAttributeLabel(state, { variableId: variable, ...props }), color }
    ));
    const edges = props.displayEdges.map(type => (
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
  DropObstacle,
  connect(makeMapStateToProps),
)(NarrativeControlPanel);
