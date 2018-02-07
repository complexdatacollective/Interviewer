import { connect } from 'react-redux';
import { compose, lifecycle, withState, setPropTypes } from 'recompose';
import PropTypes from 'prop-types';
import { assetUrl } from '../utils/protocol';

const mapStateToProps = state => ({
  getAssetUrl: assetPath => assetUrl(state.protocol.path, assetPath),
});

const pathAsAssetUrl = compose(
  connect(mapStateToProps),
  withState('assetUrl', 'setAssetUrl', ''),
  setPropTypes({
    path: PropTypes.string.isRequired, // for assetUrl
  }),
  lifecycle({
    componentDidMount() {
      const { getAssetUrl, path, setAssetUrl } = this.props;
      getAssetUrl(path).then(url => setAssetUrl(url));
    },
  }),
);

export default pathAsAssetUrl;
