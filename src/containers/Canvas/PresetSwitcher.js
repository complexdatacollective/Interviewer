import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import cx from 'classnames';
import { Icon } from '../../ui/components';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { NarrativeKey } from './';

class PresetSwitcher extends PureComponent {
  constructor() {
    super();

    this.state = {
      openKey: false,
    };
  }
  createPresetList = (preset, index) => {
    const classes = cx(
      'accordion-item__radio',
      { 'accordion-item__radio--selected': this.props.presetIndex === index },
    );
    return (
      <div className="accordion-item" key={index} >
        <span className={classes} />
        {preset.label}
      </div>
    );
  };

  toggleKey = () => {
    this.setState({
      openKey: !this.state.openKey,
    });
  }

  render() {
    const {
      presets,
      presetIndex,
      subject,
      displayEdges,
      convexHulls,
    } = this.props;

    const currentPreset = presets[presetIndex];

    const navigationClasses = cx(
      'preset-switcher__navigation ',
      { 'preset-switcher__navigation--hidden': this.state.openKey },
    );

    return (
      <div className="preset-switcher" id="preset-switcher">
        <div
          className={cx(navigationClasses, 'preset-switcher__navigation--previous', { 'preset-switcher__navigation--disabled': presetIndex === 0 })}
          onClick={() => this.props.updatePreset(presetIndex - 1)}
        >
          <Icon name="chevron-left" />
        </div>
        <div className="preset-switcher__label">
          <div style={{ width: '100%' }} onClick={this.toggleKey}>
            <h4>{presets[presetIndex].label}</h4>
          </div>
          <NarrativeKey
            subject={subject}
            highlights={currentPreset.highlight}
            toggleHighlights={this.toggleHighlights}
            displayEdges={displayEdges}
            toggleEdges={this.toggleEdges}
            convexHulls={convexHulls}
            toggleConvex={this.toggleConvex}
            open={this.state.openKey}
          />
        </div>
        <div
          className={cx(navigationClasses, 'preset-switcher__navigation--next', { 'preset-switcher__navigation--disabled': presetIndex + 1 === presets.length })}
          onClick={() => this.props.updatePreset(presetIndex + 1)}
        >
          <Icon name="chevron-right" />
        </div>
      </div>
    );
  }
}

PresetSwitcher.propTypes = {
  presets: PropTypes.array.isRequired,
  presetIndex: PropTypes.number.isRequired,
  updatePreset: PropTypes.func.isRequired,
  subject: PropTypes.object.isRequired,
  displayEdges: PropTypes.array,
  convexHulls: PropTypes.string,
};

PresetSwitcher.defaultProps = {
  displayEdges: null,
  convexHulls: null,
};

export default compose(
  DropObstacle,
)(PresetSwitcher);
