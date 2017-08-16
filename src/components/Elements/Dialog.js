import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'network-canvas-ui';

/**
  * Renders a dialog box.
  */
const Dialog = (props) => {
  const {
    title,
    content,
    showCancelButton,
    onDialogCancel,
    onDialogConfirm,
  } = props;

  let cancelButton = null;
  if (showCancelButton) {
    cancelButton = <Button onClick={onDialogCancel} content="Cancel" />;
  }

  return (
    <div className="dialog">
      <h1>{ title }</h1>
      <p>
        { content }
      </p>
      <footer>
        { cancelButton }
        <Button onClick={onDialogConfirm} content="Confirm" />
      </footer>
    </div>
  );
};

Dialog.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  showCancelButton: PropTypes.bool,
  onDialogCancel: PropTypes.func,
  onDialogConfirm: PropTypes.func,
};

Dialog.defaultProps = {
  title: 'This is my dialog title',
  content: 'This is my dialog.',
  showCancelButton: true,
  onDialogCancel: {},
  onDialogConfirm: {},
};

export default Dialog;
