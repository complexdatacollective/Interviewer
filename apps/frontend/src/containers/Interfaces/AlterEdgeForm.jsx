import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkEdgesForType } from '../../selectors/interface';
import SlideFormEdge from '../SlidesForm/SlideFormEdge';
import SlidesForm from '../SlidesForm/SlidesForm';

const AlterEdgeForm = (props) => (
  <SlidesForm
    itemName="edge"
    slideForm={SlideFormEdge}
    parentClass="alter-edge-form"
    {...props}
  />
);

function makeMapStateToProps() {
  const getStageEdges = makeNetworkEdgesForType();

  const mapStateToProps = (state, props) => ({
    items: getStageEdges(state, props),
  });

  return mapStateToProps;
}

const mapDispatchToProps = {
  updateItem: sessionsActions.updateEdge,
};

const withAlterStore = connect(makeMapStateToProps, mapDispatchToProps);

export { AlterEdgeForm };

export default withAlterStore(AlterEdgeForm);
