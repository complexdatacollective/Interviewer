import React from 'react';
import PropTypes from 'prop-types';
import { Audio, Image, Video } from '../../components';

const renderItem = (item) => {
  switch (item.type) {
    case 'text':
      // TODO: remove this and replace with markdown component (see #421)
      // eslint-disable-next-line react/no-danger
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
  * Information Interface
  */
const Information = ({ stage: { title, items } }) => (
  <div className="interface instructions-interface">
    <div className="instructions-interface__frame">
      <h1 className="instructions-interface__title type--title-1">{ title }</h1>
      <div className="instructions-interface__items">
        { items && renderItems(items) }
      </div>
    </div>
  </div>
);

Information.propTypes = {
  stage: PropTypes.object.isRequired,
};

export default Information;
