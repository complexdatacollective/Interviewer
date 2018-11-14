import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ReactMarkdown from 'react-markdown';
import { Audio, BackgroundImage, Video } from '../../components';
import defaultMarkdownRenderers from '../../utils/markdownRenderers';
import { InformationContentType } from '../../protocol-consts';

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

const getItemComponent = (item) => {
  switch (item.type) {
    case InformationContentType.text:
      return (
        <ReactMarkdown
          source={item.content}
          allowedTypes={TAGS}
          renderers={defaultMarkdownRenderers}
        />
      );
    case InformationContentType.image:
      return (
        <BackgroundImage
          url={item.content}
          className="information-interface__background-image"
        />
      );
    case InformationContentType.audio:
      return <Audio url={item.content} controls autoPlay />;
    case InformationContentType.video:
      return <Video url={item.content} loop={item.loop} autoPlay />;
    default:
      return null;
  }
};

const renderItem = (item, index) => {
  const itemClasses = cx(
    'information-interface__item',
    `information-interface__item--type-${item.type}`,
    `information-interface__item--size-${item.size}`,
  );

  return (
    <div className={itemClasses} key={index}>
      {getItemComponent(item)}
    </div>
  );
};

const renderItems = items => (
  items ? items.map(renderItem) : null
);

/**
 * Information Interface
 */
const Information = ({ stage: { title, items } }) => (
  <div className="interface information-interface">
    <div className="information-interface__frame">
      <h1 className="information-interface__title type--title-1">{title}</h1>
      <div className="information-interface__items">{renderItems(items)}</div>
    </div>
  </div>
);

Information.propTypes = {
  stage: PropTypes.object.isRequired,
};

export default Information;
