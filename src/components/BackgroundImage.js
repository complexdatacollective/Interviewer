import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { assetUrl } from '../utils/protocol';

class BackgroundImage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      src: '',
    };
  }

  componentDidMount() {
    const { getAssetUrl, path } = this.props;
    getAssetUrl(path).then(src => this.setState({ src })).catch(console.log);
  }

  render() {
    const { getAssetUrl, path, style, ...props } = this.props;
    return (
      <div
        style={{ ...style, backgroundImage: `url(${this.state.src})` }}
        {...props}
      />
    );
  };
};

BackgroundImage.propTypes = {
  path: PropTypes.string.isRequired,
  style: PropTypes.object,
  getAssetUrl: PropTypes.func.isRequired,
};

BackgroundImage.defaultProps = {
  style: {},
};

const mapStateToProps = state => ({
  getAssetUrl: assetPath => assetUrl(state.protocol.path, assetPath),
});

export { BackgroundImage };

export default connect(mapStateToProps)(BackgroundImage);
