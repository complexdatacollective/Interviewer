import React, { Component } from 'react';
import Promise from 'bluebird';
import { ProtocolInterface } from '../components';

var loadProtocol = function(component) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();

    request.onload = function() {
      if(request.status >= 200 && request.status < 400) {
        var remoteComponentSrc = request.responseText;
        window.eval(remoteComponentSrc);
        return resolve(protocol());  // protocol is the assumed entry point in /protocols/hello.js
      } else {
        return reject();
      }
    };

    request.open('GET', component.src);
    request.send();
  });
}

var BlankStage = React.createClass({
  render: function () {
    return React.createElement('div', null, 'Space intentionally left blank');
  }
});

class ProtocolManager extends Component {
  constructor(props) {
     super(props);
     this.state = { stage: BlankStage };
   }

  componentDidMount() {
    loadProtocol({
      src: '/protocols/hello.js'
    })
      .then((protocol) => {
        this.setState({
          stage: protocol.stages[0]
        });
      });
  }

  render() {
    return (
      <div>
        <h1>ProtocolManager</h1>
        <ProtocolInterface stage={this.state.stage} />
      </div>
    );
  }
};

export default ProtocolManager;
