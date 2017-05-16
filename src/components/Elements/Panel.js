import React from 'react';

const Panel = (props) => {
  const {
    title,
    children
  } = props;

  return (
    <div className='panel'>
      <div className='panel__heading'><h3>{ title }</h3></div>
      <div className='panel__content'>
        { children }
      </div>
    </div>
  );
}

export default Panel;
