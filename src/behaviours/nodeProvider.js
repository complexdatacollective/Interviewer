import { connect } from 'react-redux';
import { makeGetProviderNodes } from '../selectors/node-provider';

const NodeProvider = (WrappedComponent) => {
  function makeMapStateToProps() {
    const getProviderNodes = makeGetProviderNodes();

    return function mapStateToProps(state, props) {
      return {
        nodes: getProviderNodes(state, props),
      };
    };
  }

  return connect(makeMapStateToProps)(WrappedComponent);
};

export default NodeProvider;
