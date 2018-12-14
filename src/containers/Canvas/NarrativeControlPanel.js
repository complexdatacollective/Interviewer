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
      allEdgeTypes,
      highlights,
      presets,
      toggleEdgeType,
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
                <div key={index}>{highlight.variable}</div>
              ))}
            </div>
          </Accordion>
          <Accordion label="Links">
            <div>
              {allEdgeTypes.map((edge, index) => (
                <div key={index} onClick={() => toggleEdgeType(index)}>{edge}</div>
              ))}
            </div>
          </Accordion>
          <Accordion label="Contexts"><div>dfds</div></Accordion>
        </div>
      </div>
    );
  }
}

NarrativeControlPanel.propTypes = {
  allEdgeTypes: PropTypes.array,
  displayEdges: PropTypes.array,
  highlights: PropTypes.array,
  presets: PropTypes.array,
  toggleEdgeType: PropTypes.func,
  updatePreset: PropTypes.func,
};

NarrativeControlPanel.defaultProps = {
  allEdgeTypes: [],
  displayEdges: [],
  highlights: [],
  presets: [],
  toggleEdgeType: () => {},
  updatePreset: () => {},
};

export default NarrativeControlPanel;
