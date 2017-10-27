/* eslint-disable */

var createElement = environment.React.createElement;
var bindActionCreators = environment.bindActionCreators;

var MODAL_NEW_NODE = 'MODAL_NEW_NODE';

var MyAmazingInterface = environment.createReactClass({
  handleAddNode: function (node, _, form) {
    if (node) {
      var newNode = Object.assign({}, node, this.props.newNodeAttributes);
      this.props.addNode(newNode);
      form.reset();  // Is this the "react/redux way"?
      this.props.closeModal(MODAL_NEW_NODE);
    }
  },

  render: function() {
     var label = function (node) { return node.nickname; }
     var form = this.props.config.params.form;
     var index = 0;

     return createElement('div', { key: index++, className: "name-generator" },
      [
        createElement('div', { key:index++, className: "name-generator__main" },
          createElement('div', { key:index++, className: "name-generator__nodes" },
            [
              createElement('h1', { key: index++ }, 'My Amazing Interface'),
              createElement(api.elements.NodeList, {
                key: index++,
                network: this.props.activeOriginNetwork,
                label: label
              })
            ]
          )
        ),
        createElement(api.elements.Modal, { key:index++, name: MODAL_NEW_NODE, title: form.title },
          createElement(api.elements.Form, Object.assign({ key: index++, form: form.formName, onSubmit: this.handleAddNode }, form))
        ),
        createElement('button', { key: index++, className: "name-generator__add-person", onClick: function() { this.props.openModal(MODAL_NEW_NODE); }.bind(this) },
          'Add a person'
        )
      ]
    );
  }
});

function mapStateToProps(state) {
  return {
    newNodeAttributes:  api.selectors.session.newNodeAttributes(state),
    activeOriginNetwork: api.selectors.network.activeOriginNetwork(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    addNode: bindActionCreators(api.actions.network.addNode, dispatch),
    closeModal: bindActionCreators(api.actions.modal.closeModal, dispatch),
    openModal: bindActionCreators(api.actions.modal.openModal, dispatch),
  };
}

MyAmazingInterface = environment.connect(mapStateToProps, mapDispatchToProps)(MyAmazingInterface);

register({
  type: 'interface',
  name: 'Amazing',
  module: MyAmazingInterface,
});
