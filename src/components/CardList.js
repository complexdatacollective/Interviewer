import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../utils/StaggeredTransitionGroup';
import { scrollable, selectable } from '../behaviours';
import { protocolRegistry } from '../selectors/rehydrate';
import { Card } from '.';

const EnhancedCard = selectable(Card);

class CardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: [],
    };
  }

  selected = node => !!this.state.selected.find(current => current.uid === node.uid);

  toggleCard = (node) => {
    const index = this.state.selected.findIndex(current => current.uid === node.uid);
    if (index !== -1) {
      this.setState({
        selected: this.state.selected.filter((ele, i) => index !== i),
      });
    } else {
      this.setState({
        selected: this.state.selected.concat(node),
      });
    }
  };

  render() {
    const {
      nodes,
      label,
    } = this.props;

    return (
      <StaggeredTransitionGroup
        className="card-list"
        component="div"
        delay={animation.duration.fast * 0.2}
        duration={animation.duration.slow}
        start={animation.duration.slow + 3}
        transitionName="card-list--transition"
        transitionLeave={false}
      >
        {
          nodes.map(node => (
            <span key={node.uid}>
              <EnhancedCard
                label={label(node)}
                selected={this.selected(node)}
                details={node}
                onSelected={() => this.toggleCard(node)}
              />
            </span>
          ))
        }
      </StaggeredTransitionGroup>
    );
  }
}

CardList.propTypes = {
  nodes: PropTypes.array.isRequired,
  label: PropTypes.func,
};

CardList.defaultProps = {
  nodes: [],
  label: () => (''),
};

function mapStateToProps(state) {
  return {
    variables: protocolRegistry(state).node.person.variables,
  };
}

export default compose(
  scrollable,
  connect(mapStateToProps),
)(CardList);

