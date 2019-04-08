import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withBounds } from '../../behaviours';

import ConvexHulls from '../../components/Canvas/ConvexHulls';
import { makeGetNodesByCategorical } from '../../selectors/canvas';
import { makeGetCategoricalOptions } from '../../selectors/network';

function makeMapStateToProps() {
  const getNodesByGroup = makeGetNodesByCategorical();
  const getCategoricalOptions = makeGetCategoricalOptions();

  return function mapStateToProps(state, props) {
    const nodesByGroup = getNodesByGroup(state, props);
    const categoricalOptions = getCategoricalOptions(
      state, { variableId: props.groupVariable, ...props },
    );
    return {
      nodesByGroup,
      categoricalOptions,
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
  withBounds,
)(ConvexHulls);
