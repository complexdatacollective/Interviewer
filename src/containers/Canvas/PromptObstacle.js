import React, { PureComponent } from 'react';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import PromptSwiper from '../PromptSwiper';
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
  DropObstacle,
)(PromptObstacle);
