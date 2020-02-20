import React from 'react';
import { Flipped } from 'react-flip-toolkit';


const MotionTab = (props) => {
  console.log('motiontab', props);
  return (
    <Flipped
      flipId={props.id}
    >
      <div className={props.show ? 'motion-tab motion-tab--show' : 'motion-tab motion-tab--hide'}>
        {props.children}
      </div>
    </Flipped>
  );
};

export default MotionTab;
