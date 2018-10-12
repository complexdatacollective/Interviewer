import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import StatsPanel from '../../components/MainMenu/StatsPanel';
import { actionCreators as uiActions } from '../../ducks/modules/ui';
import { actionCreators as sessionActions } from '../../ducks/modules/session';

const mapDispatchToProps = dispatch => ({
  onFinishInterview: () => {
    dispatch(uiActions.update({ isMenuOpen: false }));
    dispatch(sessionActions.endSession());
    dispatch(push('/'));
  },
});

export default connect(null, mapDispatchToProps)(StatsPanel);
