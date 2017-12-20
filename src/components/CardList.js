import React, { Component } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { animation } from 'network-canvas-ui';
import StaggeredTransitionGroup from '../utils/StaggeredTransitionGroup';
import { scrollable, selectable } from '../behaviours';
import { Card } from '.';

const EnhancedCard = selectable(Card);

/**
  * Card List
  * @extends Component
  */
class CardList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: [],
    };
  }

  /**
    * @param {object} node
    */
  selected = node => !!this.state.selected.find(current => current.uid === node.uid);

  /**
    * toggle whether the card is selected or not.
    * @param {object} node
    */
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
      details,
      label,
      nodes,
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
                details={details(node)}
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
  details: PropTypes.func,
  label: PropTypes.func,
  nodes: PropTypes.array.isRequired,
};

CardList.defaultProps = {
  details: () => (''),
  label: () => (''),
  nodes: [],
};

export default compose(
  scrollable,
)(CardList);

