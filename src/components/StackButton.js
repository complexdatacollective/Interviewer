import React from 'react';
import { motion } from 'framer-motion';

const MockCard = ({ modifierClass, cardColor, insetColor }) => (
  <div
    className={`mock-card mock-card--${modifierClass}`}
    style={{
      background: insetColor,
    }}
  >
    <div
      className="main"
      style={{
        background: cardColor,
      }}
    />
  </div>
);

const StackOfCards = ({ children, ...rest }) => (
  <motion.div
    className="stack-of-cards"
    whileHover={{
      scale: 1.05,
    }}
    whileTap={{
      scale: 0.95,
    }}
  >
    {children}
    <MockCard {...rest} modifierClass="three" />
    <MockCard {...rest} modifierClass="two" />
    <MockCard {...rest} modifierClass="one" />
  </motion.div>
);

const StackButton = ({
  cardColor, insetColor, label, children, clickHandler,
}) => (
  <motion.div
    className="stack-button"
    onClick={clickHandler}
  >
    <h4 className="stack-button__label">{label}</h4>
    <StackOfCards cardColor={cardColor} insetColor={insetColor}>
      <div className="stack-button__content">{children}</div>
    </StackOfCards>
  </motion.div>
);

export default StackButton;
