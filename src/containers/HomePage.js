import React, { Component } from 'react';
import { Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FaPlus from '../../node_modules/react-icons/fa/plus'
import { actionCreators as networkActions } from '../ducks/modules/network';

import { NodeForm } from './Forms';
import { Button, Icon, Grid, Card } from 'semantic-ui-react'

class HomePage extends Component {
  handleNodeSubmit = () => {
    const { addNode, nodeForm } = this.props;

    addNode(nodeForm.values);
  }

  renderSubmitButton() {
    return (
      <Button primary type='submit'>Add Node</Button>
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
      <div className='grid__container'>
        <div className='grid__item grid--p-small'>
          <h1 className='type--home-title title--center'>
            Welcome {participant.userProfile && participant.userProfile.name} <FaPlus />
          </h1>
          <h1 className='type--home-title title--center'>
            <Link to='protocol'>Access sample protocol</Link>
          </h1>
          <h3 className='type--title-3'>Here are your nodes</h3>
          <Grid columns={2}>
            <Grid.Row>
              {network.nodes.map((node, idx) => {
                return (
                  <Grid.Column key={idx}>
                    <Card className='node__card'>
                      <Card.Header>
                        <Icon
                          name='cancel'
                          color='red'
                          link
                          onClick={() => removeNode(idx)} />
                      </Card.Header>
                      <Card.Content>
                        {node.fName && node.fName} {node.lName && node.lName}
                      </Card.Content>
                    </Card>
                  </Grid.Column>
                );
              })}
            </Grid.Row>
          </Grid>
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
