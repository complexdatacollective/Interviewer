import { compose, withProps } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePortal } from '@codaco/ui';
import { DropTarget, MonitorDropTarget } from '../behaviours/DragAndDrop';

/**
  * Renders a droppable NodeBin which accepts `EXISTING_NODE`.
  */
const NodeBin = ({
  willAccept,
  isOver,
}) => {
  const classNames = cx(
    'node-bin',
    { 'node-bin--active': willAccept },
    { 'node-bin--hover': willAccept && isOver },
  );

  const Portal = usePortal();

  return (
    <Portal>
      <div className={classNames} />
    </Portal>
  );
};

NodeBin.propTypes = {
  isOver: PropTypes.bool,
  willAccept: PropTypes.bool,
};

NodeBin.defaultProps = {
  isOver: false,
  willAccept: false,
};

export default compose(
  withProps((props) => ({
    accepts: ({ meta }) => props.accepts(meta),
    onDrop: ({ meta }) => props.dropHandler(meta),
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(NodeBin);
