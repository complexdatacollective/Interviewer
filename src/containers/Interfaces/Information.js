import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import emoji from 'emoji-dictionary';
import { Audio, Image, Video } from '../../components';

const TAGS = [
  'break',
  'emphasis',
  'heading',
  'link',
  'list',
  'listItem',
  'paragraph',
  'strong',
  'thematicBreak',
];

const emojiSupport = text => text.replace(/:\w+:/gi, name => emoji.getUnicode(name));

const renderItem = (item) => {
  switch (item.type) {
    case 'text':
      return (
        <ReactMarkdown
          source={item.content}
          allowedTypes={TAGS}
          renderers={{ text: emojiSupport }}
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
