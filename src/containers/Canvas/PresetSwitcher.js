import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import cx from 'classnames';
import { Icon } from '../../ui/components';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import { PresetSwitcherKey } from './';


class PresetSwitcher extends PureComponent {
  constructor() {
    super();

    this.state = {
      openKey: false,
    };
  }

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
      isFreeze,
      toggleConvex,
      toggleEdges,
      toggleHighlights,
      showResetButton,
      resetInteractions,
      toggleFreeze,
    } = this.props;

    const currentPreset = presets[presetIndex];

    const navigationClasses = cx(
      'preset-switcher__navigation ',
      { 'preset-switcher__navigation--hidden': this.state.openKey },
    );

    const freezeClasses = cx(
      'preset-switcher__freeze',
      { 'preset-switcher__freeze--active': isFreeze },
    );

    return (
      <div className="preset-switcher">
        <PresetSwitcherKey
          subject={subject}
          highlights={currentPreset.highlight}
          toggleHighlights={toggleHighlights}
          displayEdges={displayEdges}
          toggleEdges={toggleEdges}
          convexHulls={convexHulls}
          toggleConvex={toggleConvex}
          open={this.state.openKey}
          key={presetIndex}
        />
        <div
          className={cx(navigationClasses, 'preset-switcher__navigation--previous', { 'preset-switcher__navigation--disabled': presetIndex === 0 })}
          onClick={() => this.props.updatePreset(presetIndex - 1)}
        >
          <Icon name="chevron-left" />
        </div>
        <div className={freezeClasses} onClick={toggleFreeze}>
          <h1>&#10052;</h1>
        </div>
        <div
          className={cx('preset-switcher__reset-button', { 'preset-switcher__reset-button--show': showResetButton })}
          onClick={resetInteractions}
        >
          <Icon name="reset" />
        </div>
        <div className="preset-switcher__label">
          <div style={{ width: '100%' }} onClick={this.toggleKey}>
            <h4>{presets[presetIndex].label}</h4>
          </div>
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
  isFreeze: PropTypes.bool,
  toggleConvex: PropTypes.func.isRequired,
  toggleEdges: PropTypes.func.isRequired,
  toggleHighlights: PropTypes.func.isRequired,
  showResetButton: PropTypes.bool.isRequired,
  resetInteractions: PropTypes.func.isRequired,
  toggleFreeze: PropTypes.func,
};

PresetSwitcher.defaultProps = {
  displayEdges: null,
  convexHulls: null,
  isFreeze: false,
  toggleFreeze: () => {},
};

export default compose(
  DropObstacle,
)(PresetSwitcher);
