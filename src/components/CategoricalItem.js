import React from 'react';
import { compose, withProps, withState } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Flipped } from 'react-flip-toolkit';
import ReactMarkdown from 'react-markdown';
import { ALLOWED_MARKDOWN_LABEL_TAGS } from '@codaco/ui/src/utils/config';

import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';
import { NodeList } from './';

/**
  * Renders a droppable CategoricalBin item
  */
const CategoricalItem = ({
  accentColor,
  details,
  id,
  isExpanded,
  isOver,
  label,
  nodes,
  onClick,
  onClickItem,
  sortOrder,
  willAccept,
}) => {
  const classNames = cx(
    'categorical-item',
    { 'categorical-item--hover': willAccept && isOver },
    { 'categorical-item--expanded': isExpanded },
  );

  return (
    <Flipped flipId={id}>
      <div
        className={classNames}
        style={{ '--categorical-item-color': accentColor }}
        onClick={onClick}
      >
        <div className="categorical-item__disk" />
        <div className="categorical-item__inner">
          <Flipped inverseFlipId={id} scale>
            <div className="categorical-item__title">
              <h3>
                <ReactMarkdown source={label} allowedTypes={ALLOWED_MARKDOWN_LABEL_TAGS} />
              </h3>
              {(!isExpanded && details) &&
                <h5>
                  <ReactMarkdown source={details} allowedTypes={ALLOWED_MARKDOWN_LABEL_TAGS} />
                </h5>}
            </div>
          </Flipped>
          {isExpanded &&
            <div className="categorical-item__content">
              <NodeList
                listId={`CATBIN_NODE_LIST_${label}`}
                id={`CATBIN_NODE_LIST_${label}`}
                onItemClick={onClickItem}
                items={nodes}
                sortOrder={sortOrder}
              />
            </div>
          }
        </div>
      </div>
    </Flipped>
  );
};

CategoricalItem.propTypes = {
  accentColor: PropTypes.string,
  details: PropTypes.string,
  id: PropTypes.string.isRequired,
  isExpanded: PropTypes.bool,
  isOver: PropTypes.bool,
  label: PropTypes.string,
  nodes: PropTypes.array,
  onClick: PropTypes.func,
  onClickItem: PropTypes.func,
  sortOrder: PropTypes.array,
  willAccept: PropTypes.bool,
};

CategoricalItem.defaultProps = {
  accentColor: 'black',
  details: '',
  isExpanded: false,
  isOver: false,
  label: 'undefined',
  nodes: [],
  onClick: () => {},
  onClickItem: () => {},
  sortOrder: [],
  willAccept: false,
};

export { CategoricalItem as UnconnectedCategoricalItem };

export default compose(
  withState('recentNode', 'setRecentNode', {}),
  withProps(props => ({
    accepts: () => true,
    onDrop: ({ meta }) => {
      props.onDrop({ meta });
      props.setRecentNode(meta);
    },
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(CategoricalItem);
