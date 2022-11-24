import { connect } from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { ToastManager } from '@codaco/ui';
import { actionCreators as toastActions } from '../ducks/modules/toasts';

const mapStateToProps = (state) => ({
  toasts: state.toasts,
});

const mapDispatchToProps = (dispatch) => ({
  removeToast: bindActionCreators(toastActions.removeToast, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
)(ToastManager);
