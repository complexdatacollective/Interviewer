import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { Markdown as UIMarkdown } from '@codaco/ui/lib/components/Fields';

import ExternalLink from './ExternalLink';

const ALLOWED_MARKDOWN_TAGS = [
  'br',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'p',
  'strong',
  'hr',
  'a',
];

const ALLOWED_MARKDOWN_LABEL_TAGS = [
  'br',
  'em',
  'strong',
  'ul',
  'ol',
  'li',
  'a',
];

const ALLOWED_MARKDOWN_INLINE_LABEL_TAGS = ['em', 'strong', 'a'];

const EMPTY_RENDERERS = {};

const externalLinkRenderer = ({ children, href }) =>
  href ? <ExternalLink href={href}>{children}</ExternalLink> : <>{children}</>;

const Markdown = ({ allowedElements, markdownRenderers, ...props }) => {
  const combinedRenderers = useMemo(
    () => ({
      a: externalLinkRenderer,
      ...markdownRenderers,
    }),
    [markdownRenderers],
  );

  return (
    <UIMarkdown
      {...props}
      allowedElements={allowedElements}
      markdownRenderers={combinedRenderers}
    />
  );
};

Markdown.propTypes = {
  allowedElements: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  markdownRenderers: PropTypes.object,
};

Markdown.defaultProps = {
  allowedElements: ALLOWED_MARKDOWN_TAGS,
  className: 'markdown',
  markdownRenderers: EMPTY_RENDERERS,
};

const MarkdownLabel = ({ label, className, inline }) => (
  <Markdown
    className={className}
    allowedElements={
      inline ? ALLOWED_MARKDOWN_INLINE_LABEL_TAGS : ALLOWED_MARKDOWN_LABEL_TAGS
    }
    label={String(label ?? '')}
  />
);

MarkdownLabel.propTypes = {
  label: PropTypes.node.isRequired,
  className: PropTypes.string,
  inline: PropTypes.bool,
};

MarkdownLabel.defaultProps = {
  className: 'form-field-label',
  inline: false,
};

export { Markdown, MarkdownLabel };
