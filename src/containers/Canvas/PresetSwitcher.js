import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import cx from 'classnames';
import { Icon } from '@codaco/ui';
import HoverMarquee from '@codaco/ui/lib/components/HoverMarquee';
import { DropObstacle } from '../../behaviours/DragAndDrop';
import PresetSwitcherKey from './PresetSwitcherKey';

class PresetSwitcher extends PureComponent {
  constructor() {
    super();

    this.state = {
      open: false,
    };
  }

  toggleOpen = () => {
    this.setState((oldState) => ({
      open: !oldState.open,
    }));
  }

  render() {
    const {
      presets,
      activePreset,
      highlightIndex,
      isFrozen,
      shouldShowResetButton,
      shouldShowFreezeButton,
      onResetInteractions,
      onChangePreset,
      onToggleFreeze,
      onToggleHulls,
      onToggleEdges,
      onToggleHighlighting,
      onChangeHighlightIndex,
    } = this.props;

    const { open } = this.state;

    const currentActivePreset = presets[activePreset];

    const navigationClasses = cx(
      'preset-switcher__navigation ',
      { 'preset-switcher__navigation--hidden': open },
    );

    const freezeClasses = cx(
      'preset-switcher__freeze',
      { 'preset-switcher__freeze--active': isFrozen },
    );

    return (
      <div className="preset-switcher">
        <PresetSwitcherKey
          preset={currentActivePreset}
          highlightIndex={highlightIndex}
          changeHighlightIndex={onChangeHighlightIndex}
          toggleHighlighting={onToggleHighlighting}
          toggleEdges={onToggleEdges}
          toggleHulls={onToggleHulls}
          isOpen={open}
          key={activePreset}
        />
        <div
          className={cx(navigationClasses,
            'preset-switcher__navigation--previous',
            { 'preset-switcher__navigation--disabled': activePreset === 0 })}
          onClick={() => onChangePreset(activePreset - 1)}
        >
          <Icon name="chevron-left" />
        </div>
        {shouldShowFreezeButton && (
          <div className={freezeClasses} onClick={onToggleFreeze}>
            <h1>&#10052;</h1>
          </div>
        )}
        <div
          className={cx(
            'preset-switcher__reset-button',
            { 'preset-switcher__reset-button--show': shouldShowResetButton },
          )}
          onClick={onResetInteractions}
        >
          <Icon name="reset" />
        </div>
        <div className="preset-switcher__label">
          <div style={{ width: '100%' }} onClick={this.toggleOpen}>
            <h4><HoverMarquee>{currentActivePreset.label}</HoverMarquee></h4>
          </div>
        </div>
        <div
          className={cx(
            navigationClasses,
            'preset-switcher__navigation--next',
            { 'preset-switcher__navigation--disabled': activePreset + 1 === presets.length },
          )}
          onClick={() => onChangePreset(activePreset + 1)}
        >
          <Icon name="chevron-right" />
        </div>
      </div>
    );
  }
}

PresetSwitcher.propTypes = {
  presets: PropTypes.array.isRequired,
  activePreset: PropTypes.number.isRequired,
  highlightIndex: PropTypes.number.isRequired,
  isFrozen: PropTypes.bool.isRequired,
  shouldShowResetButton: PropTypes.bool.isRequired,
  shouldShowFreezeButton: PropTypes.bool.isRequired,
  onResetInteractions: PropTypes.func.isRequired,
  onChangePreset: PropTypes.func.isRequired,
  onToggleFreeze: PropTypes.func.isRequired,
  onToggleHulls: PropTypes.func.isRequired,
  onToggleEdges: PropTypes.func.isRequired,
  onToggleHighlighting: PropTypes.func.isRequired,
  onChangeHighlightIndex: PropTypes.func.isRequired,
};

PresetSwitcher.defaultProps = {
};

export default compose(
  DropObstacle,
)(PresetSwitcher);
