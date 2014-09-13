/* global network, extend */
/* exported listSelect */
var listSelect = function ListSelect(options) {

  //global vars
  var listSelect = {};
  listSelect.options = {
    targetEl: $('.container'),
    variables: [],
    heading: "This is a default heading",
    subheading: "And this is a default subheading"
  };

  extend(listSelect.options, options);

  var eventHandler = function() {

  };

  listSelect.init = function() {

  };

  listSelect.init();

  return listSelect;
};