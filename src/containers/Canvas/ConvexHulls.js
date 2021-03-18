import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withBounds } from '../../behaviours';
import ConvexHulls from '../../components/Canvas/ConvexHulls';
import { makeGetCategoricalOptions } from '../../selectors/network';
import { entityAttributesProperty } from '../../utils/network-exporters/src/utils/reservedAttributes';

function makeMapStateToProps() {
  const getCategoricalOptions = makeGetCategoricalOptions();

  return function mapStateToProps(state, props) {
    const nodesByGroup = (nodes, categoricalVariable) => {
      const groupedList = {};

      nodes.forEach((node) => {
        const categoricalValues = node[entityAttributesProperty][categoricalVariable];

        // Filter out nodes with no value for this variable.
        if (!categoricalValues) { return; }

        categoricalValues.forEach((categoricalValue) => {
          if (groupedList[categoricalValue]) {
            groupedList[categoricalValue].nodes.push(node);
          } else {
            groupedList[categoricalValue] = { group: categoricalValue, nodes: [] };
            groupedList[categoricalValue].nodes.push(node);
          }
        });
      });

      return groupedList;
    };

    const categoricalOptions = getCategoricalOptions(
      state, { variableId: props.groupVariable, ...props },
    );

    return {
      nodesByGroup: nodesByGroup(props.nodes, props.groupVariable),
      categoricalOptions,
    };
  };
}

export default compose(
  connect(makeMapStateToProps),
  withBounds,
)(ConvexHulls);
