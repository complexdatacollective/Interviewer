import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkEdgesForType } from '../../selectors/interface';
import SlideFormEdge from '../AlterForms/SlideFormEdge';
import SlideForm from '../AlterForms/SlideForm';

const AlterEdgeForm = props => (
  <SlideForm
    itemName="edge"
    FormComponent={SlideFormEdge}
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

export default withAlterStore(AlterEdgeForm);
