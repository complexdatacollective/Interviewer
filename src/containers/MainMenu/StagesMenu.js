import { connect } from 'react-redux';
import StagesMenu from '../../components/MainMenu/StagesMenu';
import { stages } from '../../selectors/session';

function mapStateToProps(state) {
  const currentStages = stages(state);

  return {
    currentStages,
  };
}

export default connect(mapStateToProps)(StagesMenu);

