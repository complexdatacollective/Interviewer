import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { compose } from 'redux';
import { Icon } from '@codaco/ui';
import withPrompt from '../behaviours/withPrompt';
import { entityAttributesProperty } from '../ducks/modules/network';
import { Node } from '.';

class QuickNodeForm extends PureComponent {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    newNodeAttributes: PropTypes.object.isRequired,
    newNodeModelData: PropTypes.object.isRequired,
    stage: PropTypes.object.isRequired,
    targetVariable: PropTypes.string.isRequired,
    nodeIconName: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.timer = null;

    this.state = {
      nodeLabel: '',
      show: false,
    };
  }

  handleOpenForm = () => {
    this.setState(({ show }) => ({ show: !show }));
  }

  handleBlur = () => {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      this.setState({
        show: false,
        nodeLabel: '',
      });
    }, 500);
  };

  handleSubmitClick = (e) => {
    clearTimeout(this.timer);
    this.handleSubmitForm(e);
  };

  handleChange = (e) => {
    this.setState({
      nodeLabel: e.target.value,
      cancelBlur: false,
    });
  }

  handleSubmitForm = (e) => {
    e.preventDefault();

    if (this.state.nodeLabel.length === 0) {
      return;
    }

    this.props.addNode(
      this.props.newNodeModelData,
      {
        ...this.props.newNodeAttributes,
        [this.props.targetVariable]: this.state.nodeLabel,
      },
    );

    this.setState({
      nodeLabel: '',
    });
  }

  render() {
    const {
      nodeIconName,
      targetVariable,
      stage,
    } = this.props;

    const {
      show,
      nodeLabel,
    } = this.state;

    const nodeProps = {
      type: stage.subject.type,
      [entityAttributesProperty]: {
        [targetVariable]: nodeLabel.length === 0 ? ' ' : nodeLabel,
      },
    };

    return (
      <div className="quick-add">
        <div className={cx('quick-add-form', { 'quick-add-form--show': show })}>
          <form autoComplete="off" onSubmit={this.handleSubmitForm}>
            {show
            && (
            <input
              className="quick-add-form__label-input"
              key="label"
              autoFocus // eslint-disable-line
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              placeholder="Type a name and press enter..."
              value={nodeLabel}
              type="text"
            />
            )}
          </form>
        </div>
        <div className={cx('flip-button', { 'flip-button--flip': nodeLabel.length > 0 })}>
          <div className="flip-button-inner">
            <div className="flip-button-front" onClick={this.handleOpenForm}>
              <Icon name={nodeIconName} />
            </div>
            <div className="flip-button-back" onClick={this.handleSubmitClick}>
              <Node {...nodeProps} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { QuickNodeForm };

export default compose(
  withPrompt,
)(QuickNodeForm);
