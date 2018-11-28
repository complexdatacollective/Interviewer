import React, { PureComponent } from 'react';
import Radar from './Radar';
import { BackgroundImage } from '../../components';
import sociogramOptionsProps from './propTypes';

class Background extends PureComponent {
  static propTypes = {
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    concentricCircles: 3,
    skewedTowardCenter: true,
    image: null,
  };

  render() {
    const { concentricCircles, skewedTowardCenter, image } = this.props;
    let background;

    if (image) {
      background = <BackgroundImage className="sociogram-background__image" url={image} />;
    } else {
      background = <Radar n={concentricCircles} skewed={skewedTowardCenter} />;
    }

    return (
      <div className="sociogram-background">
        { background }
      </div>
    );
  }
}

export { Background };

export default Background;
