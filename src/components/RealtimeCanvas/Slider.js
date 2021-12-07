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

const Slider = ({
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
    <div className="panel-slider">
      <motion.div
        ref={containerRef}
        className="panel-slider__container"
      >
        <motion.div
          ref={handleRef}
          drag="x"
          dragElastic={false}
          dragMomentum={false}
          dragSnapToOrigin
          dragConstraints={containerRef}
          onDragEnd={handleDragEnd}
          className="panel-slider__handle"
          style={{ x: position }}
        />
      </motion.div>
    </div>
  );
};

Slider.defaultProps = {
  min: 0,
  max: 100,
  onChange: () => {},
  onChangeEnd: () => {},
};

export default Slider;
