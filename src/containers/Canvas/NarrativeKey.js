import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Icon } from '../../ui/components';
import { Accordion } from '.';

import { makeGetEdgeColor, makeGetEdgeLabel, makeGetNodeAttributeLabel, makeGetCategoricalOptions } from '../../selectors/protocol';

class NarrativeKey extends Component {
  constructor() {
    super();

    this.panel = React.createRef();
  }

  getComponentWidth = () => (this.state.open ? getComputedStyle(this.panel.current).getPropertyValue('--narrative-panel-width') : 0);

  togglePanel = () => {
    this.setState({
      open: !this.state.open,
    });
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
      'narrative-key',
      { 'narrative-key--open': open },
    );

    return (
      <div className={classNames} ref={this.panel}>
        <div className="narrative-key__content">
          <Accordion open label="Attributes" onAccordionToggle={toggleHighlights}>
            {highlightLabels.map((highlight, index) => (
              <div className="accordion-item" key={index}>
                <Icon
                  name="highlighted"
                  color={highlight.color}
                />
                {highlight.label}
              </div>
            ))}
          </Accordion>
          <Accordion open label="Links" onAccordionToggle={toggleEdges}>
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
          <Accordion open label="Groups" onAccordionToggle={toggleConvex}>
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

NarrativeKey.propTypes = {
  convexOptions: PropTypes.array,
  edges: PropTypes.array,
  highlightLabels: PropTypes.array,
  toggleConvex: PropTypes.func,
  toggleEdges: PropTypes.func,
  toggleHighlights: PropTypes.func,
  open: PropTypes.bool.isRequired,
};

NarrativeKey.defaultProps = {
  edges: [],
  convexOptions: [],
  highlightLabels: [],
  toggleConvex: () => {},
  toggleEdges: () => {},
  toggleHighlights: () => {},
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
  connect(makeMapStateToProps),
)(NarrativeKey);
