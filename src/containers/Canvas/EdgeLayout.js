import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { flow, groupBy, pick, values, flatten } from 'lodash';
import { networkNodes, networkEdges } from '../../selectors/interface';
import { nodePrimaryKeyProperty, nodeAttributesProperty } from '../../ducks/modules/network';
import { EdgeLayout } from '../../components/Canvas/EdgeLayout';

const edgeCoords = (edge, { nodes, layout }) => {
  const from = nodes.find(n => n[nodePrimaryKeyProperty] === edge.from);
  const to = nodes.find(n => n[nodePrimaryKeyProperty] === edge.to);

  if (!from || !to) { return { from: null, to: null }; }

  return {
    key: `${edge.from}_${edge.type}_${edge.to}`,
    type: edge.type,
    from: from[nodeAttributesProperty][layout],
    to: to[nodeAttributesProperty][layout],
  };
};

const edgesToCoords = (edges, { nodes, layout }) =>
  edges.map(
    edge => edgeCoords(
      edge,
      { nodes, layout },
    ),
  );

const edgesOfTypes = (edges, types) =>
  flow(
    allEdges => groupBy(allEdges, 'type'), // sort by type
    groupedEdges => pick(groupedEdges, types), // discard unwanted types
    groupedEdges => values(groupedEdges), // flatten
    selectedEdges => flatten(selectedEdges),
  )(edges);

const getDisplay = (_, props) => props.display;
const getLayout = (_, props) => props.layout;

const makeGetDisplayEdges = () =>
  createSelector(
    networkNodes,
    networkEdges,
    getDisplay,
    getLayout,
    (nodes, edges, display, layout) => {
      const selectedEdges = edgesOfTypes(edges, display);
      return edgesToCoords(
        selectedEdges,
        { nodes, layout },
      );
    },
  );

const makeMapStateToProps = () => {
  const getDisplayEdges = makeGetDisplayEdges();

  const mapStateToProps = (state, { display, layout }) => ({
    displayEdges: getDisplayEdges(state, { display, layout }),
  });

  return mapStateToProps;
};

export default connect(makeMapStateToProps)(EdgeLayout);
