import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '../../utils/CSSVariables';

const duration = {
  content: {
    enter: getCSSVariableAsNumber('--animation-duration-fast-ms'),
    exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  },
  wrapper: {
    enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
    exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  },
};

const TimelineOpts = { easing: getCSSVariableAsObject('--animation-easing-js') };

const getCssProp = (computedStyle, name) => computedStyle.getPropertyValue(name).trim();

class Search extends Component {
  constructor(props) {
    super(props);
    this.runEnterTimeline = this.runEnterTimeline.bind(this);
    this.runExitTimeline = this.runExitTimeline.bind(this);
  }

  runEnterTimeline(el) {
    const elStyle = getComputedStyle(el);
    const boundingRect = el.getBoundingClientRect();
    const collapsedSize = getCssProp(elStyle, '--collapsed-square-size');
    const borderRadius = getCssProp(elStyle, '--border-radius');

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
      borderRadius: [collapsedSize, borderRadius],
      maxHeight: [collapsedSize, boundingRect.height],
      width: () => {
        const cw = document.documentElement.clientWidth;
        const rightOffset = cw - boundingRect.right;
        return [collapsedSize, cw - (2 * rightOffset)];
      },
    };

    const contentAnimation = {
      opacity: [0, 1],
    };

    this.cancelRunningAnimation();
    this.runningAnimation = anime.timeline(TimelineOpts)
      .add({
        targets: el,
        ...wrapperAnimation,
        duration: duration.wrapper.enter,
        complete: () => {
          const pxStyles = el.style;
          pxStyles.maxHeight = '';
          pxStyles.width = '';
        },
      })
      .add({
        targets: this.contentsContainer,
        ...contentAnimation,
        duration: duration.content.enter,
      });
  }

  runExitTimeline(el) {
    const elStyle = getComputedStyle(el);
    const collapsedSize = getCssProp(elStyle, '--collapsed-square-size');

    const inverseWrapperAnimation = {
      borderRadius: getCssProp(elStyle, '--collapsed-square-size'),
      maxHeight: [el.getBoundingClientRect().height, collapsedSize],
      width: collapsedSize,
    };

    const inverseContentAnimation = {
      opacity: 0,
    };

    this.cancelRunningAnimation();
    this.runningAnimation = anime.timeline(TimelineOpts)
      .add({
        targets: this.contentsContainer,
        ...inverseContentAnimation,
        duration: duration.content.exit,
      })
      .add({
        targets: el,
        ...inverseWrapperAnimation,
        duration: duration.wrapper.exit,
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
          enter: duration.wrapper.enter + duration.content.enter,
          exit: duration.wrapper.exit + duration.content.exit,
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
  children: PropTypes.any.isRequired,
};

Search.defaultProps = {
  children: null,
};

export default Search;
