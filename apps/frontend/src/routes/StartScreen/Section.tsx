import { motion } from 'framer-motion';

type Props = {
  children: React.ReactNode,
  className?: string,
}

const Section: React.FC<Props> = ({
    children,
    className,
    ...rest
  }) => {

  const springy = {
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        when: 'beforeChildren',
      },
    },
    hide: {
      opacity: 0,
      y: '5rem',
    },
  };

  return (
    <motion.section
      className={className}
      variants={springy}
      {...rest} // eslint-disable-line react/jsx-props-no-spreading
    >
      {children}
    </motion.section>
  );
};

export default Section;
