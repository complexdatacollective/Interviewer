import React, { PureComponent } from 'react';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';

import { Button } from '../../ui/components';
import { withBounds } from '../../behaviours';
import { DropObstacle } from '../../behaviours/DragAndDrop';

class ButtonObstacle extends PureComponent {
  render() {
    const {
      label,
      accepts,
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
  accepts: PropTypes.func.isRequired,
  label: PropTypes.string,
};

ButtonObstacle.defaultProps = {
  label: '',
};

export default compose(
  withBounds,
  withHandlers({
    accepts: () => () => true,
  }),
  DropObstacle,
)(ButtonObstacle);
