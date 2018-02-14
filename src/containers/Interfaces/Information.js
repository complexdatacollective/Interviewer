import React from 'react';
import PropTypes from 'prop-types';
import { Audio, Image, Video } from '../../components';

const renderItem = (item) => {
  switch (item.type) {
    case 'text':
      // TODO: Do we really need it to contain html tags?
      // JRM: yes, we do. We can use the xss library (as we already do in Dialog)
      // to be safer.
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
      <h1 className="instructions-interface__title">{ title }</h1>
      <div className="instructions-interface__items">
        { renderItems(items) }
      </div>
    </div>
  </div>
);

Information.propTypes = {
  stage: PropTypes.object.isRequired,
};

export default Information;
