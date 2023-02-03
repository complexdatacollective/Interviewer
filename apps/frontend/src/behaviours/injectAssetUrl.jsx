import { connect } from 'react-redux';
import {
  compose, lifecycle, withState, setPropTypes, mapProps,
} from 'recompose';
import PropTypes from 'prop-types';
import { getAssetManifest } from '../selectors/protocol';
import getMediaAssetUrl from '../utils/protocol/getMediaAssetUrl';
import { get } from '../utils/lodash-replacements';

// curry asset fetcher with protocol path from state
const mapStateToProps = (state) => ({
  getAssetUrl: (asset) => {
    const { protocolUID } = state.sessions[state.activeSessionId];
    const assetManifest = getAssetManifest(state);
    const assetSource = get(assetManifest, [asset, 'source']);

    if (!assetSource) { return Promise.resolve(null); }

    return getMediaAssetUrl(
      protocolUID,
      assetSource,
    );
  },
});

const injectAssetUrl = compose(
  connect(mapStateToProps),
  setPropTypes({
    asset: PropTypes.string.isRequired,
  }),
  withState('url', 'setUrl', ''),
  lifecycle({
    componentDidMount() {
      const { getAssetUrl, asset, setUrl } = this.props;

      if (!asset) { return; }

      getAssetUrl(asset).then(setUrl);
    },
  }),
  mapProps(({
    dispatch, getAssetUrl, setUrl, url, ...rest
  }) => ({ ...rest, url })),
);

export default injectAssetUrl;
