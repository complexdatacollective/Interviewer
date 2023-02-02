import PropTypes from 'prop-types';
import { getCSSVariableAsObject, getCSSVariableAsNumber } from '@codaco/ui';

const Node = ({
  children, index, stagger, ...props
}) => {
  const delay = stagger ? index * 30 : 0;

  const animationThreshold = 20;

  const duration = {
    enter: getCSSVariableAsNumber('--animation-duration-standard-ms'),
    exit: getCSSVariableAsNumber('--animation-duration-fast-ms'),
  };

  const enterAnimation = {
    opacity: [0, 1],
    translateY: ['50%', 0],
    easing: 'easeOutElastic',
    duration: duration.enter,
  };

  const exitAnimation = {
    opacity: [1, 0],
    scale: [1, 0],
    easing: getCSSVariableAsObject('--animation-easing-js'),
    duration: duration.exit,
  };

  console.log('ReactTransitionGroup and anime removed. Node needs to be updated.')

  return (
    <div
      {...props}
    >
      {children}
    </div>
  );
};

Node.propTypes = {
  children: PropTypes.any,
  index: PropTypes.number,
  stagger: PropTypes.bool,
};

Node.defaultProps = {
  children: null,
  index: 0,
  stagger: false,
};

export default Node;
