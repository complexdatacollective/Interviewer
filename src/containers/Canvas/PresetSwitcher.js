import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import cx from 'classnames';
import { Icon } from '@codaco/ui';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import PresetSwitcherKey from './PresetSwitcherKey';

class PresetSwitcher extends PureComponent {
  constructor() {
    super();

    this.state = {
      openKey: false,
    };
  }

  toggleKey = () => {
    const { openKey } = this.state;
    this.setState({
      openKey: !openKey,
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
      highlightIndex,
      highlights,
      toggleHighlights,
      toggleHighlightIndex,
      showResetButton,
      showFreezeButton,
      resetInteractions,
      toggleFreeze,
      updatePreset,
    } = this.props;

    const {
      openKey,
    } = this.state;

    const navigationClasses = cx(
      'preset-switcher__navigation ',
      { 'preset-switcher__navigation--hidden': openKey },
    );

    const freezeClasses = cx(
      'preset-switcher__freeze',
      { 'preset-switcher__freeze--active': isFreeze },
    );

    return (
      <div className="preset-switcher">
        <PresetSwitcherKey
          subject={subject}
          highlights={highlights}
          highlightIndex={highlightIndex}
          toggleHighlights={toggleHighlights}
          toggleHighlightIndex={toggleHighlightIndex}
          displayEdges={displayEdges}
          toggleEdges={toggleEdges}
          convexHulls={convexHulls}
          toggleConvex={toggleConvex}
          open={openKey}
          key={presetIndex}
        />
        <div
          className={cx(navigationClasses, 'preset-switcher__navigation--previous', { 'preset-switcher__navigation--disabled': presetIndex === 0 })}
          onClick={() => updatePreset(presetIndex - 1)}
        >
          <Icon name="chevron-left" />
        </div>
        {showFreezeButton
          && (
          <div className={freezeClasses} onClick={toggleFreeze}>
            <h1>&#10052;</h1>
          </div>
          )}
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
          onClick={() => updatePreset(presetIndex + 1)}
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
  highlightIndex: PropTypes.number.isRequired,
  highlights: PropTypes.array,
  toggleHighlights: PropTypes.func.isRequired,
  toggleHighlightIndex: PropTypes.func.isRequired,
  showResetButton: PropTypes.bool.isRequired,
  showFreezeButton: PropTypes.bool,
  resetInteractions: PropTypes.func.isRequired,
  toggleFreeze: PropTypes.func,
};

PresetSwitcher.defaultProps = {
  displayEdges: null,
  convexHulls: null,
  highlights: [],
  isFreeze: false,
  showFreezeButton: true,
  toggleFreeze: () => {},
};

export default compose(
  DropObstacle,
)(PresetSwitcher);
