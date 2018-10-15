import { connect } from 'react-redux';
import StagesMenu from '../../components/MainMenu/StagesMenu';
import { stages } from '../../selectors/session';

function mapStateToProps(state) {
  const currentStages = stages(state);

  const withIndex = currentStages.map((stage, index) => ({ ...stage, index }));

  return {
    currentStages: withIndex,
  };
}

export default connect(mapStateToProps)(StagesMenu);

