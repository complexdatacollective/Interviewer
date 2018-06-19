import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Radar from './Radar';
import { makeGetSociogramOptions } from '../../selectors/sociogram';
import { BackgroundImage } from '../../components';
import sociogramOptionsProps from './propTypes';

class Background extends PureComponent {
  static propTypes = {
    ...sociogramOptionsProps,
  };

  static defaultProps = {
    concentricCircles: 4,
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

function makeMapStateToProps() {
  const getSociogramOptions = makeGetSociogramOptions();

  return function mapStateToProps(state, props) {
    return {
      ...getSociogramOptions(state, props),
    };
  };
}

export { Background };

export default connect(makeMapStateToProps)(Background);
