import { connect } from 'react-redux';
import { compose, lifecycle, withState, setPropTypes, mapProps } from 'recompose';
import PropTypes from 'prop-types';
import { assetUrl } from '../utils/protocol';

// curry asset fetcher with protocol path from state
const mapStateToProps = state => ({
  getAssetUrl: url => assetUrl(state.protocol.path, url),
});

const injectAssetUrl = compose(
  connect(mapStateToProps),
  setPropTypes({
    url: PropTypes.string.isRequired,
  }),
  withState('assetUrl', 'setAssetUrl', ''),
  lifecycle({
    componentDidMount() {
      const { getAssetUrl, url, setAssetUrl } = this.props;
      getAssetUrl(url).then(setAssetUrl);
    },
  }),
  mapProps(({ dispatch, getAssetUrl, setAssetUrl, assetUrl: url, ...rest }) => ({ ...rest, url })),
);

export default injectAssetUrl;
