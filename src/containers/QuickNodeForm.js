import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { compose } from 'redux';
import { connect } from 'react-redux';
import withPrompt from '../behaviours/withPrompt';
import { entityAttributesProperty } from '../ducks/modules/network';
import { makeGetNodeDisplayVariable } from '../selectors/network';
import { Icon } from '../ui/components/';
import { Node } from './';

class QuickNodeForm extends PureComponent {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    newNodeAttributes: PropTypes.object.isRequired,
    newNodeModelData: PropTypes.object.isRequired,
    stage: PropTypes.object.isRequired,
    displayVariable: PropTypes.string.isRequired,
    nodeIconName: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      nodeLabel: '',
      show: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleCloseForm = this.handleCloseForm.bind(this);
    this.handleOpenForm = this.handleOpenForm.bind(this);
  }

  handleOpenForm = () => {
    this.setState({
      show: true,
    });
  }

  handleCloseForm = () => {
    this.setState({
      show: false,
      nodeLabel: '',
    });
  }

  handleChange(e) {
    this.setState({
      nodeLabel: e.target.value,
    });
  }

  handleSubmitForm = (e) => {
    e.preventDefault();
    this.props.addNode(
      this.props.newNodeModelData,
      {
        ...this.props.newNodeAttributes,
        [this.props.displayVariable]: this.state.nodeLabel,
      },
    );

    this.setState({
      nodeLabel: '',
    });
  }

  render() {
    const {
      nodeIconName,
      displayVariable,
      stage,
    } = this.props;

    const {
      show,
      nodeLabel,
    } = this.state;

    return (
      <div className="quick-add">
        <div className={cx('quick-add-form', { 'quick-add-form--show': show })}>
          <form autoComplete="off" onSubmit={this.handleSubmitForm}>
            {show &&
            <input
              className="quick-add-form__label-input"
              key="label"
              autoFocus // eslint-disable-line
              onChange={this.handleChange}
              onBlur={this.handleCloseForm}
              placeholder="Type a name and press enter..."
              value={nodeLabel}
              type="text"
            />
            }
          </form>
        </div>
        <div className={cx('flip-button', { 'flip-button--flip': nodeLabel.length > 0 })}>
          <div className="flip-button-inner">
            <div className="flip-button-front" onClick={this.handleOpenForm}>
              <Icon name={nodeIconName} />
            </div>
            <div className="flip-button-back">
              <Node
                type={stage.subject.type}
                {...{ [entityAttributesProperty]: {
                  [displayVariable]: this.state.nodeLabel,
                } }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const getNodeDisplayVariable = makeGetNodeDisplayVariable();

  return {
    displayVariable: getNodeDisplayVariable(state, props),
  };
};

export { QuickNodeForm };

export default compose(
  withPrompt,
  connect(mapStateToProps, null),
)(QuickNodeForm);
