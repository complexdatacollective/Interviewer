/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import { Audio, Image, Video } from '../../components';

const renderItem = (item) => {
  switch (item.type) {
    case 'text':
      // TODO: Do we really need it to contain html tags?
      return <div dangerouslySetInnerHTML={{ __html: item.content }} />;
    case 'image':
      return <Image url={item.content} />;
    case 'audio':
      return <Audio url={item.content} controls autoPlay />;
    case 'video':
      return <Video url={item.content} controls autoPlay />;
    default:
      return null;
  }
};

const renderItems = items =>
  items.map((item, index) => (
    <div className="instructions-interface__item" key={index}>
      {renderItem(item)}
    </div>
  ));

/**
  * Instruction Interface
  */
const Instructions = ({ stage: { title, items } }) => {
  return (
    <div className="interface instructions-interface">
      <div className="instructions-interface__frame">
        <h1 className="instructions-interface__title">{ title }</h1>
        <div className="instructions-interface__items">
          { renderItems(items) }
        </div>
      </div>
    </div>
  );
};

Instructions.propTypes = {
};

export default Instructions;
