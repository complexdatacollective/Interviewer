import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Icon } from '../../ui/components';
import { Accordion } from '.';

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

  render() {
    const {
      convexHulls,
      displayEdges,
      highlights,
      presets,
      toggleConvex,
      toggleEdges,
      toggleHighlights,
      updatePreset,
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
              {presets.map((preset, index) => (
                <div key={index} onClick={() => updatePreset(index)}>{preset.label}</div>
              ))}
            </div>
          </Accordion>
          <Accordion label="Highlighted">
            <div>
              {highlights.map((highlight, index) => (
                <div key={index} onClick={toggleHighlights}>{highlight.variable}</div>
              ))}
            </div>
          </Accordion>
          <Accordion label="Links">
            <div>
              {displayEdges.map((edge, index) => (
                <div key={index} onClick={toggleEdges}>{edge}</div>
              ))}
            </div>
          </Accordion>
          <Accordion label="Contexts"><div onClick={toggleConvex}>{convexHulls}</div></Accordion>
        </div>
      </div>
    );
  }
}

NarrativeControlPanel.propTypes = {
  convexHulls: PropTypes.string,
  displayEdges: PropTypes.array,
  highlights: PropTypes.array,
  presets: PropTypes.array,
  toggleConvex: PropTypes.func,
  toggleEdges: PropTypes.func,
  toggleHighlights: PropTypes.func,
  updatePreset: PropTypes.func,
};

NarrativeControlPanel.defaultProps = {
  displayEdges: [],
  convexHulls: '',
  highlights: [],
  presets: [],
  toggleConvex: () => {},
  toggleEdges: () => {},
  toggleHighlights: () => {},
  updatePreset: () => {},
};

export default NarrativeControlPanel;
