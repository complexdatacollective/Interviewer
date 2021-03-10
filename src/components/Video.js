/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import injectAssetUrl from '../behaviours/injectAssetUrl';

class Video extends Component {
  constructor(props) {
    super(props);
    this.video = React.createRef();
  }

  handleClick = () => {
    if (!this.video.current) { return; }

    if (this.video.current.paused) {
      this.video.current.play();
    } else {
      this.video.current.pause();
    }
  };

  render() {
    const { url, description, ...props } = this.props;
    return (
      <video
        {...props}
        ref={this.video}
        src={url}
        playsInline
        onClick={this.handleClick}
      >
        {description}
      </video>
    );
  }
}

Video.propTypes = {
  description: PropTypes.string,
  url: PropTypes.string.isRequired,
};

Video.defaultProps = {
  description: '',
};

export { Video };

export default injectAssetUrl(Video);
