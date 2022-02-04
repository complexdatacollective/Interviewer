import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui/lib/utils/CSSVariables';

const getCssProp = (computedStyle, name) => computedStyle.getPropertyValue(name).trim();

const getBaseFontSizePx = () => {
  const baseFontSize = getCssProp(getComputedStyle(document.body), 'font-size');
  return parseFloat(baseFontSize, 10);
};

/**
 * @param  {string} cssValue trimmed css value
 * @return {number} pxValue (float)
 */
const getPxValue = (cssValue) => {
  if (!cssValue) {
    return 0;
  }
  if (/%$/.test(cssValue)) {
    console.warn('Unsupported % value', cssValue); // eslint-disable-line no-console
    return 0;
  }
  if (/em$/.test(cssValue)) {
    return parseFloat(cssValue) * getBaseFontSizePx();
  }
  return parseFloat(cssValue);
};

class Search extends Component {
  constructor(props) {
    super(props);
    this.runEnterTimeline = this.runEnterTimeline.bind(this);
    this.runExitTimeline = this.runExitTimeline.bind(this);

    this.duration = {
      content: {
        enter: getCSSVariableAsNumber('--animation-duration-fast-ms'),
        exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
      },
      wrapper: {
        enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
        exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
      },
    };

    this.TimelineOpts = { easing: getCSSVariableAsObject('--animation-easing-js') };
  }

  runEnterTimeline(el) {
    const elStyle = getComputedStyle(el);
    const boundingRect = el.getBoundingClientRect();
    const collapsedSizePx = getPxValue(getCssProp(elStyle, '--collapsed-square-size-js'));
    const expandedSizePx = getPxValue(getCssProp(elStyle, 'width'));
    const borderRadiusPx = getPxValue(getCssProp(elStyle, '--border-radius'));

    // Default Styles are expressed in terms of viewport, but we want to
    // animate from a specific size, so we work in pixels. On complete,
    // reset to inherit default styles.
    //
    // For now, using height & width rather than scale so that borderRadius works.
    // Could animate SVG for better performance.
    //
    // Note that just calling anime.timeline() modifies element styling,
    // even if not played.
    const wrapperAnimation = {
      borderRadius: [collapsedSizePx, borderRadiusPx],
      maxHeight: [collapsedSizePx, boundingRect.height],
      width: () => [collapsedSizePx, expandedSizePx],
    };

    // Search may be positioned by parent; animate horizontal centering
    const rightCollapsed = getPxValue(getCssProp(elStyle, '--right-collapsed-js'));
    const rightExpanded = getPxValue(getCssProp(elStyle, '--right-offset'));
    if (rightCollapsed && rightExpanded) {
      wrapperAnimation.right = [rightCollapsed, rightExpanded];
    }

    const contentAnimation = {
      opacity: [0, 1],
    };

    this.cancelRunningAnimation();
    this.runningAnimation = anime.timeline(this.TimelineOpts)
      .add({
        targets: el,
        ...wrapperAnimation,
        duration: this.duration.wrapper.enter,
        complete: () => {
          const pxStyles = el.style;
          pxStyles.maxHeight = '';
          pxStyles.width = '';
        },
      })
      .add({
        targets: this.contentsContainer,
        ...contentAnimation,
        duration: this.duration.content.enter,
      });
  }

  runExitTimeline(el) {
    const elStyle = getComputedStyle(el);
    const collapsedSizePx = getPxValue(getCssProp(elStyle, '--collapsed-square-size-js'));

    const inverseWrapperAnimation = {
      borderRadius: collapsedSizePx,
      maxHeight: [el.getBoundingClientRect().height, collapsedSizePx],
      width: collapsedSizePx,
    };

    // Search may be positioned by parent; animate horizontal centering
    const rightCollapsed = getCssProp(elStyle, '--right-collapsed-js');
    const rightExpanded = getCssProp(elStyle, '--right-offset');
    if (rightCollapsed && rightExpanded) {
      inverseWrapperAnimation.right = [getPxValue(rightExpanded), getPxValue(rightCollapsed)];
    }

    const inverseContentAnimation = {
      opacity: 0,
    };

    this.cancelRunningAnimation();
    this.runningAnimation = anime.timeline(this.TimelineOpts)
      .add({
        targets: this.contentsContainer,
        ...inverseContentAnimation,
        duration: this.duration.content.exit,
      })
      .add({
        targets: el,
        ...inverseWrapperAnimation,
        duration: this.duration.wrapper.exit,
      });
  }

  cancelRunningAnimation() {
    if (this.runningAnimation) {
      this.runningAnimation.pause();
      this.runningAnimation = null;
    }
  }

  render() {
    const {
      children,
      ...props
    } = this.props;

    return (
      <Transition
        {...props}
        timeout={{
          enter: this.duration.wrapper.enter + this.duration.content.enter,
          exit: this.duration.wrapper.exit + this.duration.content.exit,
        }}
        onEnter={this.runEnterTimeline}
        onExit={this.runExitTimeline}
        unmountOnExit
      >
        <div>
          <div className="search__content" ref={(contentsContainer) => { this.contentsContainer = contentsContainer; }}>
            { children }
          </div>
        </div>
      </Transition>
    );
  }
}

Search.propTypes = {
  children: PropTypes.any,
};

Search.defaultProps = {
  children: null,
};

export default Search;
