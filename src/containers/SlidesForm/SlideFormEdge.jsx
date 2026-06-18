import { find } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';

import {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
} from '@codaco/shared-consts';
import { Scroller } from '@codaco/ui';

import { getNetworkNodes, makeGetEdgeColor } from '../../selectors/network';
import Form from '../Form';
import Node from '../Node';

class SlideFormEdge extends PureComponent {
  handleSubmit = (formData) => {
    const { id, onUpdate } = this.props;
    onUpdate(id, {}, formData);
  };

  render() {
    const {
      form,
      edgeColor,
      fromNode,
      toNode,
      subject,
      initialValues,
      submitButton,
      id,
      otherNetworkEntities,
      onScroll,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...fromNode} />
          <div
            className="fake-edge"
            style={{ backgroundColor: `var(--${edgeColor})` }}
          />
          <Node {...toNode} />
          <div className="alter-form__form-container alter-edge-form__form-container">
            <Scroller onScroll={onScroll}>
              <Form
                {...form}
                className="alter-form__form alter-edge-form__form"
                initialValues={initialValues}
                autoFocus={false}
                subject={subject}
                onSubmit={this.handleSubmit}
                submitButton={submitButton}
                validationMeta={{ entityId: id }}
                otherNetworkEntities={otherNetworkEntities}
              />
            </Scroller>
          </div>
        </div>
      </div>
    );
  }
}

SlideFormEdge.propTypes = {
  form: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  subject: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  submitButton: PropTypes.object,
};

SlideFormEdge.defaultProps = {
  onScroll: () => {},
  submitButton: (
    <button type="submit" key="submit" aria-label="Submit" hidden />
  ),
};

const withEdgeProps = withProps(({ item }) => ({
  id: item[entityPrimaryKeyProperty],
  initialValues: item[entityAttributesProperty],
}));

const withStore = connect((state, props) => {
  const getEdgeColor = makeGetEdgeColor();
  const nodes = getNetworkNodes(state);

  const fromNode = find(nodes, [entityPrimaryKeyProperty, props.item.from]);
  const toNode = find(nodes, [entityPrimaryKeyProperty, props.item.to]);

  return {
    fromNode,
    toNode,
    edgeColor: getEdgeColor(state, props.item),
  };
});

const EnhancedSlideFormEdge = withEdgeProps(SlideFormEdge);

export { EnhancedSlideFormEdge as SlideFormEdge };

export default compose(withStore, withEdgeProps)(SlideFormEdge);
