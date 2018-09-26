import React, { PureComponent } from 'react';
import { withHandlers, compose } from 'recompose';
import PropTypes from 'prop-types';

import { PromptSwiper } from '../../containers';
import { withBounds } from '../../behaviours';
import { DropObstacle } from '../../behaviours/DragAndDrop';

class PromptObstacle extends PureComponent {
  render() {
    const {
      className,
      ...rest
    } = this.props;

    return (
      <div className={className}>
        <PromptSwiper {...rest} />
      </div>
    );
  }
}

PromptObstacle.propTypes = {
  className: PropTypes.string,
};

PromptObstacle.defaultProps = {
  className: '',
};

export default compose(
  withBounds,
  withHandlers({
    accepts: () => () => true,
  }),
  DropObstacle,
)(PromptObstacle);
