import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { assetUrl } from '../utils/protocol';

class Image extends Component {
  static propTypes = {
    alt: PropTypes.string,
    path: PropTypes.string.isRequired,
    getAssetUrl: PropTypes.func.isRequired,
  };

  static defaultProps = {
    alt: '',
  };

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
    const { getAssetUrl, path, alt, ...props } = this.props;
    return <img src={this.state.src} alt={alt} {...props} />;
  }
}

const mapStateToProps = state => ({
  getAssetUrl: assetPath => assetUrl(state.protocol.path, assetPath),
});

export { Image };

export default connect(mapStateToProps)(Image);
