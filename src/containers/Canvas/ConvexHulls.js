import { connect } from 'react-redux';
import { compose } from 'recompose';

import ConvexHulls from '../../components/Canvas/ConvexHulls';
import { makeGetNodesByCategorical } from '../../selectors/canvas';

function makeMapStateToProps() {
  const getNodesByGroup = makeGetNodesByCategorical();

  return function mapStateToProps(state, props) {
    const nodesByGroup = getNodesByGroup(state, props);
    return {
      nodesByGroup,
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
)(ConvexHulls);
