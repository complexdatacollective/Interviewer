import { connect } from 'react-redux';
import StagesMenu from '../../components/MainMenu/StagesMenu';
import { getProtocolStages } from '../../selectors/protocol';

function mapStateToProps(state) {
  const currentStages = getProtocolStages(state);

  const withIndex = currentStages.map((stage, index) => ({ ...stage, index }));

  return {
    currentStages: withIndex,
  };
}

export default connect(mapStateToProps)(StagesMenu);

