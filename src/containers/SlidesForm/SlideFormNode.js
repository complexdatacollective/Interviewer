import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { filter } from 'lodash';
import { withProps, compose } from 'recompose';
import { connect } from 'react-redux';
import { Scroller } from '../../components';
import { entityAttributesProperty, entityPrimaryKeyProperty } from '../../ducks/modules/network';
import { makeNetworkEntitiesForType } from '../../selectors/interface';
import Node from '../Node';
import Form from '../Form';

class SlideFormNode extends PureComponent {
  handleSubmit = (formData) => {
    const { id, item, onUpdate } = this.props;
    // TODO: is item (node) neccessary?
    onUpdate(id, item, formData);
  }

  render() {
    const {
      form,
      item,
      initialValues,
      subject,
      submitButton,
      otherNetworkEntities,
    } = this.props;

    return (
      <div className="swiper-slide">
        <div className="slide-content">
          <Node {...item} />
          <div className="alter-form__form-container">
            <Scroller>
              <Form
                {...form}
                className="alter-form__form"
                initialValues={initialValues}
                autoFocus={false}
                subject={subject}
                onSubmit={this.handleSubmit}
                submitButton={submitButton}
                otherNetworkEntities={otherNetworkEntities}
              />
            </Scroller>
          </div>
        </div>
      </div>
    );
  }
}

SlideFormNode.propTypes = {
  form: PropTypes.object,
  subject: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  submitButton: PropTypes.object,
  otherNetworkEntities: PropTypes.array, // used for some validation functions
};

SlideFormNode.defaultProps = {
  form: {},
  onUpdate: () => {},
  otherNetworkEntities: [],
  submitButton: <button type="submit" key="submit" aria-label="Submit" hidden />,
};

const withNodeProps = withProps(({ item }) => ({
  id: item[entityPrimaryKeyProperty],
  initialValues: item[entityAttributesProperty],
}));

const withStore = connect((state, props) => {
  const networkEntitiesForType = makeNetworkEntitiesForType();
  const otherNetworkEntities = filter(networkEntitiesForType(state, props), (edge) => (
    !props.item || edge[entityPrimaryKeyProperty] !== props.item[entityPrimaryKeyProperty]));

  return {
    otherNetworkEntities,
  };
});

const EnhancedSlideFormNode = withNodeProps(SlideFormNode);

export { EnhancedSlideFormNode as SlideFormNode };

export default compose(withStore, withNodeProps)(SlideFormNode);
