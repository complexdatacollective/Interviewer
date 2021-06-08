import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import { AnimatePresence } from 'framer-motion';
import cx from 'classnames';
import { Prompt, Pips } from '../components';

/**
  * Displays prompts
  */
const PromptSwiper = (props) => {
  const {
    minimizable,
    promptIndex,
    prompts,
    prompt,
    floating,
  } = props;

  const [minimized, setMinimized] = useState(false);

  const prevPromptRef = useRef();
  useEffect(() => {
    prevPromptRef.current = promptIndex;
  }, [promptIndex]);
  const prevPromptIndex = prevPromptRef.current;

  const direction = promptIndex - prevPromptIndex;

  const classes = cx(
    'prompts',
    {
      'prompts--floating': floating,
      'prompts--minimized': minimized,
    },
  );

  const handleMinimize = () => setMinimized(!minimized);

  const minimizeButton = (
    <span className="prompts__minimizer" onClick={handleMinimize}>
      {minimized ? '?' : '—'}
    </span>
  );

  return (
    <>
      <div className={classes}>
        {(prompts.length > 1) && (
          <div className="prompts__pips">
            <Pips count={prompts.length} currentIndex={promptIndex} />
          </div>
        )}
        <AnimatePresence custom={direction} exitBeforeEnter>
          <Prompt
            key={promptIndex}
            label={prompt.text}
            direction={direction}
          />
        </AnimatePresence>
      </div>
      {minimizable && minimizeButton}
    </>
  );
};

PromptSwiper.propTypes = {
  prompts: PropTypes.any.isRequired,
  prompt: PropTypes.object.isRequired,
  promptIndex: PropTypes.number.isRequired,
  floating: PropTypes.bool,
  minimizable: PropTypes.bool,
};

PromptSwiper.defaultProps = {
  floating: false,
  minimizable: false,
};

function mapStateToProps(_, ownProps) {
  return {
    promptIndex: findIndex(ownProps.prompts, ownProps.prompt),
  };
}

export { PromptSwiper };

export default connect(mapStateToProps)(PromptSwiper);
