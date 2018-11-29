import { connect } from 'react-redux';
import { EdgeLayout } from '../../components/Canvas/EdgeLayout';
import { makeGetDisplayEdges } from '../../selectors/canvas';

const makeMapStateToProps = () => {
  const getDisplayEdges = makeGetDisplayEdges();

  const mapStateToProps = (state, { displayEdges, layout }) => ({
    displayEdges: getDisplayEdges(state, { displayEdges, layout }),
  });

  return mapStateToProps;
};

export default connect(makeMapStateToProps)(EdgeLayout);
