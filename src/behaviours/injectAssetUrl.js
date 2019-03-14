import { connect } from 'react-redux';
import { compose, lifecycle, withState, setPropTypes, mapProps } from 'recompose';
import PropTypes from 'prop-types';
import getMediaAssetUrl from '../utils/protocol/getMediaAssetUrl';

// curry asset fetcher with protocol path from state
const mapStateToProps = state => ({
  getAssetUrl: (url) => {
    const protocol = state.installedProtocols[state.sessions[state.activeSessionId].protocolUID];
    const protocolUID = state.sessions[state.activeSessionId].protocolUID;
    console.log('getasseturl', protocol, protocolUID);

    return getMediaAssetUrl(
      protocolUID,
      url,
    );
  },
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
