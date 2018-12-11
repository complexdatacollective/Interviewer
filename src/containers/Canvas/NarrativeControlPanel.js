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
      displayEdges,
      highlights,
      presets,
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
            {presets.map((preset, index) => (
              <div onClick={() => updatePreset(index)}>{preset.label}</div>
            ))}
          </Accordion>
          <Accordion label="Highlighted">
            {highlights.map(highlight => <div>{highlight.variable}</div>)}
          </Accordion>
          <Accordion label="Links">
            {displayEdges.map(edge => <div>{edge}</div>)}
          </Accordion>
          <Accordion label="Contexts"><div>dfds</div></Accordion>
        </div>
      </div>
    );
  }
}

NarrativeControlPanel.propTypes = {
  displayEdges: PropTypes.array,
  highlights: PropTypes.array,
  presets: PropTypes.array,
  updatePreset: PropTypes.func,
};

NarrativeControlPanel.defaultProps = {
  displayEdges: [],
  highlights: [],
  presets: [],
  updatePreset: () => {},
};

export default NarrativeControlPanel;
