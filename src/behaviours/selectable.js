import React, { useRef, useEffect } from 'react';
import { findDOMNode } from 'react-dom';

const selectable = WrappedComponent =>
  (props) => {
    const el = useRef();
    const onTap = () => {
      console.log('onTap');
      props.onSelected();
    };

    let element;

    useEffect(() => {
      console.log('selectable effect', el);

      if (el.current) {
        element = findDOMNode(el.current);
        element.addEventListener('click', onTap, { passive: true });
      }

      return () => {
        if (element) {
          element.removeEventListener('click', onTap);
        }
      };
    }, [el]);

    const {
      allowSelect,
      onSelected,
      ...rest
    } = props;
    console.log('selectable', props);
    // if (!allowSelect) { return <WrappedComponent {...rest} />; }
    return <WrappedComponent {...rest} ref={el} />;
  };

export default selectable;
