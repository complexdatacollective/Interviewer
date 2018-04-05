import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-react-js';
import { Audio, Image, Video } from '../../components';

const TAGS = {
  html: 'div',
  strong: 'b',
  em: 'i',
};

const renderItem = (item) => {
  switch (item.type) {
    case 'text':
      return (
        <Markdown
          markdownOptions={{ typographer: true }}
          text={item.content}
          tags={TAGS}
        />
      );
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
      <h1 className="instructions-interface__title type--title-1">{title}</h1>
      <div className="instructions-interface__items">{items && renderItems(items)}</div>
    </div>
  </div>
);

Information.propTypes = {
  stage: PropTypes.object.isRequired,
};

export default Information;
