import { connect } from 'react-redux';
import { EdgeLayout } from '../../components/Canvas/EdgeLayout';
import { makeGetDisplayEdges } from '../../selectors/canvas';

const makeMapStateToProps = () => {
  const getDisplayEdges = makeGetDisplayEdges();

  const mapStateToProps = (state, {
    subject, displayEdges, layoutVariable, stage,
  }) => ({
    edges: getDisplayEdges(state, {
      subject, displayEdges, layoutVariable, stage,
    }),
  });

  return mapStateToProps;
};

export default connect(makeMapStateToProps)(EdgeLayout);
