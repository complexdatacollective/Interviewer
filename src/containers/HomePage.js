import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators as networkActions } from '../ducks/modules/network';
import { NodeForm } from './Forms';
import { Node } from '../components';

class HomePage extends Component {
  handleNodeSubmit = () => {
    const { addNode, nodeForm } = this.props;

    addNode(nodeForm.values);
  }

  renderSubmitButton() {
    return (
      <button className="primary" type='submit'>Add Node</button>
    )
  }

  render() {
    const {
      removeNode,
      network,
      participant
    } = this.props;
    const { handleNodeSubmit } = this;

    return (
        <div className="container">
          <h1 >
            Welcome {participant.userProfile && participant.userProfile.name}
          </h1>
          <h3 >
            <Link to='protocol'>Access sample protocol</Link>
          </h3>
          <div className="col">
            {network.nodes.map((node, idx) => {
              return (
                <Node key={idx} fName={node.fName} lName={node.lName} onClick={() => removeNode(idx)}/>
              );
            })}
          </div>
          <NodeForm
            onSubmit={handleNodeSubmit}
            submitButton={this.renderSubmitButton()} />
        </div>

    );
  }
}

HomePage.propTypes = {
  auth: React.PropTypes.object,
  network: React.PropTypes.object,
  participant: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    network: state.network,
    participant: state.participant,
    nodeForm: state.form.node
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(networkActions.addNode, dispatch),
    removeNode: bindActionCreators(networkActions.removeNode, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
