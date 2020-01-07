import React, { PureComponent } from 'react';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Button } from '@codaco/ui';
import { DropObstacle } from '../../behaviours/DragAndDrop';

class ButtonObstacle extends PureComponent {
  render() {
    const {
      label,
      ...rest
    } = this.props;

    return (
      <Button
        {...rest}
      >
        {label}
      </Button>
    );
  }
}

ButtonObstacle.propTypes = {
  label: PropTypes.string,
};

ButtonObstacle.defaultProps = {
  label: '',
};

export default compose(
  DropObstacle,
)(ButtonObstacle);
