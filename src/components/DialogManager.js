import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { Dialogs } from '@codaco/ui';
import { actionCreators as dialogsActions } from '../ducks/modules/dialogs';

const mapStateToProps = (state) => ({
  dialogs: state.dialogs.dialogs,
});

const mapDispatchToProps = (dispatch) => ({
  closeDialog: bindActionCreators(dialogsActions.closeDialog, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(Dialogs);
