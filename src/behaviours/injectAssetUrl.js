import { connect } from 'react-redux';
import { compose, lifecycle, withState, setPropTypes, mapProps } from 'recompose';
import PropTypes from 'prop-types';
import getMediaAssetUrl from '../utils/protocol/getMediaAssetUrl';

// curry asset fetcher with protocol path from state
const mapStateToProps = state => ({
  getAssetUrl: url => getMediaAssetUrl(state.activeProtocol.path, url, state.activeProtocol.type),
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
