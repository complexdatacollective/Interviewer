import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { colorDictionary } from 'network-canvas-ui';
import { makeDisplayEdgesForPrompt } from '../../../selectors/sociogram';

const renderEdge = (key, color, from, to) => {
  if (!from || !to) { return null; }
  return (
    <line
      key={key}
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={color}
    />
  );
};

const renderEdges = (edges, color) =>
  edges.map(
    ({ key, from, to }) => renderEdge(key, color, from, to),
  );

export class EdgeLayout extends PureComponent {
  static propTypes = {
    displayEdges: PropTypes.array,
  };

  static defaultProps = {
    displayEdges: [],
  };

  render() {
    const { displayEdges } = this.props;
    const color = colorDictionary['edge-base'];

    return (
      <div className="edge-layout">
        <svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          { displayEdges.map(edges => renderEdges(edges, color)) }
        </svg>
      </div>
    );
  }
}

function makeMapStateToProps() {
  const displayEdgesForPrompt = makeDisplayEdgesForPrompt();

  return function mapStateToProps(state, props) {
    return {
      displayEdges: displayEdgesForPrompt(state, props),
    };
  };
}

export default connect(makeMapStateToProps)(EdgeLayout);
