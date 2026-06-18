import cx from 'classnames';
import PropTypes from 'prop-types';
import { compose, withProps } from 'recompose';

import { window as Window } from '@codaco/ui/lib/components/window';

import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';

/**
 * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
 */
const NodeBin = ({ willAccept, isOver }) => {
  const classNames = cx(
    'node-bin',
    { 'node-bin--active': willAccept },
    { 'node-bin--hover': willAccept && isOver },
  );

  return <div className={classNames} />;
};

NodeBin.propTypes = {
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
};

NodeBin.defaultProps = {
  isOver: false,
  willAccept: false,
};

export default Window(
  compose(
    withProps((props) => ({
      accepts: ({ meta }) => props.accepts(meta),
      onDrop: ({ meta }) => props.dropHandler(meta),
    })),
    DropTarget,
    MonitorDropTarget(['isOver', 'willAccept']),
  )(NodeBin),
);
