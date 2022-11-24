import { connect } from 'react-redux';
import { getAssetManifest } from '../selectors/protocol';
import { get } from '../utils/lodash-replacements';

const mapStateToProps = (state, { asset }) => {
  const assetManifest = getAssetManifest(state);
  const assetMeta = get(assetManifest, asset);

  if (!assetMeta) { return {}; }

  return assetMeta;
};

const withAssetMeta = connect(mapStateToProps);

const AssetMetaProvider = ({
  children,
  dispatch,
  id,
  ...rest
}) => children({ ...rest });

export {
  withAssetMeta,
  AssetMetaProvider,
};

export default withAssetMeta(AssetMetaProvider);
