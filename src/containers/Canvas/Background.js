import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Radar from './Radar';
import { BackgroundImage } from '../../components';

class Background extends PureComponent {
  render() {
    const { concentricCircles, skewedTowardCenter, image } = this.props;
    let background;
    if (image) {
      background = <BackgroundImage className="canvas-background__image" asset={image} />;
    } else {
      background = <Radar n={concentricCircles} skewed={skewedTowardCenter} />;
    }

    return (
      <div className="canvas-background">
        { background }
      </div>
    );
  }
}

Background.propTypes = {
  concentricCircles: PropTypes.number,
  skewedTowardCenter: PropTypes.bool,
  image: PropTypes.string,
};

Background.defaultProps = {
  concentricCircles: 3,
  skewedTowardCenter: true,
  image: null,
};

export { Background };

export default Background;
