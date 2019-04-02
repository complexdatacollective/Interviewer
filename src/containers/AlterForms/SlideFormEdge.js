import React, { PureComponent } from 'react';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getNetworkNodes } from '../../selectors/network';
import { makeGetEdgeColor } from '../../selectors/protocol';
import { Scroller } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import Node from '../Node';
import { Form } from '..';

class SlideFormEdge extends PureComponent {
  handleSubmit = (formData) => {
    const { edge, updateEdge } = this.props;
    updateEdge(edge[entityPrimaryKeyProperty], {}, formData);
  }

  render() {
    const {
      form,
      edge,
      edgeColor,
      nodes,
      index,
    } = this.props;

    const fromNode = find(nodes, [entityPrimaryKeyProperty, edge.from]);
    const toNode = find(nodes, [entityPrimaryKeyProperty, edge.to]);

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...fromNode} />
          <div className="fake-edge" style={{ backgroundColor: `var(--${edgeColor})` }} />
          <Node {...toNode} />
          <div className="alter-form__form-container">
            <Scroller>
              <Form
                {...form}
                className="alter-form__form"
                initialValues={edge[entityAttributesProperty]}
                autoFocus={false}
                form={`EDGE_FORM_${index + 1}`}
                onSubmit={this.handleSubmit}
              />
            </Scroller>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const getEdgeColor = makeGetEdgeColor();
  return {
    nodes: getNetworkNodes(state),
    edgeColor: getEdgeColor(state, props.edge),
  };
}

SlideFormEdge.propTypes = {
  form: PropTypes.object.isRequired,
  updateEdge: PropTypes.func.isRequired,
  edge: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export { SlideFormEdge };

export default connect(mapStateToProps)(SlideFormEdge);
