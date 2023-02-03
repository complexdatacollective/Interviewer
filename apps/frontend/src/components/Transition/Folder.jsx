import PropTypes from 'prop-types';
import { getCSSVariableAsNumber } from '@codaco/ui';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const appear = () => ({
  opacity: {
    value: [0, 1],
    duration: getCSSVariableAsNumber('--animation-duration-standard-ms'),
    easing: 'easeInOutQuad',
  },
  scaleY: {
    value: [0, 1],
    duration: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    easing: 'easeInOutQuad',
  },
});

const disappear = () => ({
  opacity: 0,
  scaleY: 0,
  margin: 0,
  maxHeight: 0,
  duration: getCSSVariableAsNumber('--animation-duration-standard-ms'),
});

const FolderTransition = ({ children, ...props }) => (
  <div
    {...props}
  >
    {children}
  </div>
);

FolderTransition.propTypes = {
  children: PropTypes.any,
};

FolderTransition.defaultProps = {
  children: null,
};

export default FolderTransition;
