import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  motion,
  useTransform,
  useMotionValue,
} from 'framer-motion';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

const SliderControl = ({
  min,
  max,
  value,
  onChange,
  onChangeEnd,
}) => {
  const containerRef = useRef();
  const handleRef = useRef();
  const [range, setRange] = useState(0);
  const position = useMotionValue(0);
  const nextValue = useTransform(position, [0, range], [min, max]);

  useEffect(() => {
    const relativeValue = (value - min) / (max - min);
    const nextPosition = relativeValue * range;
    position.set(nextPosition);
  }, [range, value]);

  useEffect(() => nextValue.onChange(onChange), []);

  useEffect(() => {
    if (!containerRef.current || !handleRef.current) { return; }

    const containerRect = containerRef.current.getBoundingClientRect();
    const handleRect = handleRef.current.getBoundingClientRect();

    setRange(containerRect.width - handleRect.width);
  }, []);

  const handleDragEnd = useCallback(() => {
    onChangeEnd(nextValue.get());
  }, [nextValue, onChangeEnd]);

  return (
    <div className="slider-control">
      <motion.div
        ref={containerRef}
        className="slider-control__container"
      >
        <motion.div
          ref={handleRef}
          drag="x"
          dragElastic={false}
          dragMomentum={false}
          dragSnapToOrigin
          dragConstraints={containerRef}
          onDragEnd={handleDragEnd}
          className="slider-control__handle"
          style={{ x: position }}
          whileDrag={{ scale: 1.2 }}
        />
      </motion.div>
    </div>
  );
};

SliderControl.defaultProps = {
  min: 0,
  max: 100,
  value: 0,
  onChange: noop,
  onChangeEnd: noop,
};

SliderControl.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
  onChangeEnd: PropTypes.func,
};

export default SliderControl;
