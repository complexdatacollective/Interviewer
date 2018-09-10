import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { actionCreators as sessionsActions } from '../ducks/modules/sessions';
import { nodePrimaryKeyProperty } from '../ducks/modules/network';
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

function mapDispatchToProps(dispatch) {
  return {
    removeNode: bindActionCreators(sessionsActions.removeNode, dispatch),
  };
}

export default compose(
  connect(null, mapDispatchToProps),
  withProps(props => ({
    accepts: ({ meta }) => meta.itemType === 'EXISTING_NODE',
    onDrop: ({ meta }) => props.removeNode(meta[nodePrimaryKeyProperty]),
  })),
  DropTarget,
  MonitorDropTarget(['isOver', 'willAccept']),
)(NodeBin);
