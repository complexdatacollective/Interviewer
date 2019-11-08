import React from 'react';
import { connect } from 'react-redux';
import { actionCreators as sessionsActions } from '../../ducks/modules/sessions';
import { makeNetworkNodesForType } from '../../selectors/interface';
import SlideFormNode from '../AlterForms/SlideFormNode';
import SlideForm from '../AlterForms/SlideForm';

const AlterForm = props => (
  <SlideForm
    itemName="alter"
    FormComponent={SlideFormNode}
    {...props}
  />
);

function makeMapStateToProps() {
  const getStageNodes = makeNetworkNodesForType();

  const mapStateToProps = (state, props) => ({
    items: getStageNodes(state, props),
  });

  return mapStateToProps;
}

const mapDispatchToProps = {
  updateItem: sessionsActions.updateNode,
};

const withAlterStore = connect(makeMapStateToProps, mapDispatchToProps);

export default withAlterStore(AlterForm);
